import { BigNumber, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/consts'
import { addTransactions } from 'src/features/feed/feedSlice'
import {
  CeloNativeTransferTx,
  CeloTokenTransferTx,
  CeloTransaction,
  OtherTx,
  StableTokenTransferTx,
  TokenExchangeTx,
  TransactionMap,
  TransactionType,
} from 'src/features/feed/types'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, delay, put, select } from 'typed-redux-saga'

const QUERY_DEBOUNCE_TIME = 2000 // 2 seconds
const POLL_DELAY = 10000 // 10 seconds

interface BlockscoutTxBase {
  hash: string
  value: string
  from: string
  to: string
  input: string
  gas: string
  gasUsed: string
  gasPrice: string
  nonce: string
  timeStamp: string
  contractAddress: string
  confirmations: string
  blockNumber: string
  blockHash: string
  cumulativeGasUsed: string
  transactionIndex: string
  isError?: string
}

interface BlockscoutTx extends BlockscoutTxBase {
  tokenTransfers?: BlockscoutTokenTransfer[]
}

interface BlockscoutTokenTransfer extends BlockscoutTxBase {
  tokenSymbol: string
  tokenName: string
  tokenDecimal: string
  logIndex: string
}

interface BlockscoutResponse<R> {
  status: string
  result: R
  message: string
}

// Triggers polling of feed fetching
export function* feedFetchPoller() {
  while (true) {
    yield* delay(POLL_DELAY)
    yield* put(fetchFeedActions.trigger())
  }
}

function* fetchFeed() {
  const address = yield* select((state: RootState) => state.wallet.address)
  const lastUpdatedTime = yield* select((state: RootState) => state.feed.lastUpdatedTime)
  const lastBlockNumber = yield* select((state: RootState) => state.feed.lastBlockNumber)

  if (!address) return

  const now = Date.now()
  if (lastUpdatedTime && now - lastUpdatedTime < QUERY_DEBOUNCE_TIME) return

  const { newTransactions, newLastBlockNumber } = yield* call(doFetchFeed, address, lastBlockNumber)
  yield* put(
    addTransactions({
      txs: newTransactions,
      lastUpdatedTime: now,
      lastBlockNumber: newLastBlockNumber,
    })
  )
}

export const {
  wrappedSaga: fetchFeedSaga,
  reducer: fetchFeedReducer,
  actions: fetchFeedActions,
} = createMonitoredSaga(fetchFeed, { name: 'fetchFeed' })

async function doFetchFeed(address: string, lastBlockNumber: number | null) {
  const txListP = fetchTxsFromBlockscout(address, lastBlockNumber)
  const abiInterfacesP = getAbiInterfacesForParsing()
  const [txList, abiInterfaces] = await Promise.all([txListP, abiInterfacesP])

  const newTransactions: TransactionMap = {}
  let newLastBlockNumber = lastBlockNumber || 0

  for (const tx of txList) {
    const parsedTx = parseTransaction(tx, address, abiInterfaces)
    if (!parsedTx) continue
    newTransactions[parsedTx.hash] = parsedTx
    newLastBlockNumber = Math.max(BigNumber.from(tx.blockNumber).toNumber(), newLastBlockNumber)
  }

  return { newTransactions, newLastBlockNumber }
}

// TODO confirm this works for txs with fees paid in cUSD
async function fetchTxsFromBlockscout(address: string, lastBlockNumber: number | null) {
  // TODO consider pagination here

  // First fetch the basic tx list, which includes outgoing token transfers
  let txQueryUrl = config.blockscoutUrl + '?module=account&action=txlist&address=' + address
  if (lastBlockNumber) {
    txQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const txListP = queryBlockscout<Array<BlockscoutTx>>(txQueryUrl)

  // The txlist query alone doesn't get all needed transactions
  // It excludes incoming token transfers so we need a second query to cover those
  let tokenTxQueryUrl = config.blockscoutUrl + '?module=account&action=tokentx&address=' + address
  if (lastBlockNumber) {
    tokenTxQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const tokenTxListP = queryBlockscout<Array<BlockscoutTokenTransfer>>(tokenTxQueryUrl)

  const [txList, tokenTxList] = await Promise.all([txListP, tokenTxListP])

  // Create a map of hash to txs
  const txMap = new Map<string, BlockscoutTx>()
  for (const tx of txList) {
    txMap.set(tx.hash, tx)
  }

  //  Add the token transfers to the map but under the normal txs from the first list
  for (const tx of tokenTxList) {
    // If transfer doesn't have a corresponding tx from the first list, make a placeholder
    // Most common reason would be incoming token transfer
    if (!txMap.has(tx.hash)) {
      txMap.set(tx.hash, copyTx(tx))
      continue
    }

    const parentTx = txMap.get(tx.hash)!
    if (!parentTx.tokenTransfers) {
      parentTx.tokenTransfers = []
    }
    parentTx.tokenTransfers.push(tx)
  }
  return txMap.values()
}

async function queryBlockscout<P>(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Fetch Response not okay: ${response.status}`)
  }
  const json = (await response.json()) as BlockscoutResponse<P>

  if (!json.result) {
    const responseText = await response.text()
    throw new Error(`Invalid result format: ${responseText}`)
  }

  return json.result
}

type AbiInterfaceMap = Record<Currency, utils.Interface>

async function getAbiInterfacesForParsing(): Promise<AbiInterfaceMap> {
  const goldTokenContractP = getContract(CeloContract.GoldToken)
  const stableTokenContractP = getContract(CeloContract.StableToken)
  const [goldTokenContract, stableTokenContract] = await Promise.all([
    goldTokenContractP,
    stableTokenContractP,
  ])
  return {
    [Currency.CELO]: goldTokenContract.interface,
    [Currency.cUSD]: stableTokenContract.interface,
  }
}

function parseTransaction(
  tx: BlockscoutTx,
  address: string,
  abiInterfaces: AbiInterfaceMap
): CeloTransaction | null {
  if (!tx || !tx.hash) {
    logger.warn('Ignoring invalid tx', JSON.stringify(tx))
    return null
  }

  if (!tx.to || !utils.isAddress(tx.to)) {
    logger.warn(`tx ${tx.hash} has invalid to field, ignoring`)
    return null
  }

  if (!tx.from || !utils.isAddress(tx.from)) {
    logger.warn(`tx ${tx.hash} has invalid from field, ignoring`)
    return null
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.Exchange])) {
    return parseExchangeTx(tx, address)
  }

  if (tx.tokenTransfers && tx.tokenTransfers.length) {
    // TODO support txs with multiple token transfers
    const tokenTx = tx.tokenTransfers[0]
    const currency = tokenSymbolToCurrency(tokenTx.tokenSymbol)

    if (currency === Currency.cUSD) {
      return parseStableTokenTransfer(tokenTx, address, abiInterfaces[Currency.cUSD])
    }
    if (currency === Currency.CELO) {
      return parseCeloTokenTransfer(tokenTx, address, abiInterfaces[Currency.CELO])
    }
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.StableToken])) {
    return parseOtherTokenTx(tx, abiInterfaces[Currency.cUSD])
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.GoldToken])) {
    return parseOtherTokenTx(tx, abiInterfaces[Currency.CELO])
  }

  if (areAddressesEqual(tx.to, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow outgoing
  }

  if (areAddressesEqual(tx.from, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow incoming
  }

  if (tx.value && BigNumber.from(tx.value).gt(0)) {
    return parseNativeTransferTx(tx, address)
  }

  return parseOtherTx(tx)
}

function parseStableTokenTransfer(
  tx: BlockscoutTokenTransfer,
  address: string,
  abiInterface: utils.Interface
): StableTokenTransferTx | null {
  const transfer = parseTokenTransfer(tx, address, abiInterface)
  if (!transfer) return null
  return {
    ...transfer,
    type: TransactionType.StableTokenTransfer,
    currency: Currency.cUSD,
  }
}

function parseCeloTokenTransfer(
  tx: BlockscoutTokenTransfer,
  address: string,
  abiInterface: utils.Interface
): CeloTokenTransferTx | null {
  const transfer = parseTokenTransfer(tx, address, abiInterface)
  if (!transfer) return null
  return {
    ...transfer,
    type: TransactionType.CeloTokenTransfer,
    currency: Currency.CELO,
  }
}

function parseTokenTransfer(
  tx: BlockscoutTokenTransfer,
  address: string,
  abiInterface: utils.Interface
) {
  try {
    let comment: string | undefined

    if (tx.input && tx.input.toLowerCase() !== '0x' && !BigNumber.from(tx.input).isZero()) {
      // Blockscout does most of the heavy lifting in decoding these
      // Still need to manually decode with ethers though because blockscout
      // doesn't include the comment
      const txDescription = abiInterface.parseTransaction({ data: tx.input })
      if (txDescription.name !== 'transfer' && txDescription.name !== 'transferWithComment') {
        throw new Error('Not a valid token transfer tx: ' + JSON.stringify(txDescription))
      }
      comment = txDescription.args.comment
    }

    return {
      ...parseOtherTx(tx),
      isOutgoing: areAddressesEqual(tx.from, address),
      comment,
    }
  } catch (error) {
    logger.error('Failed to parse tx data', error, tx)
    return null
  }
}

function parseExchangeTx(tx: BlockscoutTx, address: string): TokenExchangeTx | null {
  if (!tx.tokenTransfers || tx.tokenTransfers.length !== 2) {
    logger.error('Expected exchange tx to have two token transfers', tx)
    return null
  }

  const transfer1 = tx.tokenTransfers[0]
  const transfer2 = tx.tokenTransfers[1]
  let fromTransfer: BlockscoutTokenTransfer
  let toTransfer: BlockscoutTokenTransfer
  if (areAddressesEqual(address, transfer1.from)) {
    fromTransfer = transfer1
    toTransfer = transfer2
  } else {
    fromTransfer = transfer2
    toTransfer = transfer1
  }

  return {
    ...parseOtherTx(tx),
    type: TransactionType.TokenExchange,
    fromToken: tokenSymbolToCurrency(fromTransfer.tokenSymbol),
    toToken: tokenSymbolToCurrency(toTransfer.tokenSymbol),
    fromValue: fromTransfer.value,
    toValue: toTransfer.value,
  }
}

// Parse token transactions other than transfers
// The most common would probably be 'approve' calls
function parseOtherTokenTx(tx: BlockscoutTx, abiInterface: utils.Interface) {
  try {
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    if (txDescription.name === 'transfer' || txDescription.name === 'transferWithComment') {
      throw new Error(
        'Tx should have been parsed by parseTokenTransfer: ' + JSON.stringify(txDescription)
      )
    }

    // TODO identify more tx types here, jut proxying to generic parse for now
    return parseOtherTx(tx)
  } catch (error) {
    logger.error('Failed to parse tx data', error, tx)
    return null
  }
}

function parseNativeTransferTx(tx: BlockscoutTx, address: string): CeloNativeTransferTx {
  return {
    ...parseOtherTx(tx),
    type: TransactionType.CeloNativeTransfer,
    isOutgoing: areAddressesEqual(tx.from, address),
    comment: undefined,
    currency: Currency.CELO,
  }
}

function parseOtherTx(tx: BlockscoutTx): OtherTx {
  return {
    type: TransactionType.Other,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    blockNumber: BigNumber.from(tx.blockNumber).toNumber(),
    timestamp: BigNumber.from(tx.timeStamp).toNumber(),
    gasPrice: tx.gasPrice,
    gasUsed: tx.gasUsed,
  }
}

function copyTx(tx: BlockscoutTxBase): BlockscoutTx {
  return {
    hash: tx.hash,
    value: tx.value,
    from: tx.from,
    to: tx.to,
    input: tx.input,
    gas: tx.gas,
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    nonce: tx.nonce,
    timeStamp: tx.timeStamp,
    contractAddress: tx.contractAddress,
    confirmations: tx.confirmations,
    blockNumber: tx.blockNumber,
    blockHash: tx.blockHash,
    cumulativeGasUsed: tx.cumulativeGasUsed,
    transactionIndex: tx.transactionIndex,
  }
}

function tokenSymbolToCurrency(symbol: string) {
  symbol = symbol.toLowerCase()
  if (symbol === 'cusd') {
    return Currency.cUSD
  } else {
    return Currency.CELO
  }
}
