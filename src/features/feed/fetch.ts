import { BigNumber, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/consts'
import { addTransactions } from 'src/features/feed/feedSlice'
import {
  CeloNativeTransferTx,
  CeloTokenTransferTx,
  CeloTransaction,
  OtherTx,
  StableTokenTransferTx,
  TransactionMap,
  TransactionType,
} from 'src/features/feed/types'
import { getContractAbiInterface } from 'src/provider/contracts'
import { compareAddresses } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'

const QUERY_DEBOUNCE_TIME = 2000

interface BlockscoutTransaction {
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
  isError: string
}

interface BlockscoutTokenTransaction extends BlockscoutTransaction {
  tokenSymbol: string
  tokenName: string
  tokenDecimal: string
}

interface BlockscoutResponse<R> {
  status: string
  result: R
  message: string
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
  const txListP = queryBlockscout<Array<BlockscoutTransaction>>(txQueryUrl)

  // The txlist query alone doesn't get all needed transactions
  // It excludes incoming token transfers so we need a second query to cover those
  let tokenTxQueryUrl = config.blockscoutUrl + '?module=account&action=tokentx&address=' + address
  if (lastBlockNumber) {
    tokenTxQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const tokenTxListP = queryBlockscout<Array<BlockscoutTokenTransaction>>(tokenTxQueryUrl)

  const [txList, tokenTxList] = await Promise.all([txListP, tokenTxListP])

  // Then de-dupe the lists, preferring the tokenTx result as it has more info
  const txMap = new Map<string, BlockscoutTransaction | BlockscoutTokenTransaction>()
  for (const tx of txList) {
    txMap.set(tx.hash, tx)
  }
  for (const tx of tokenTxList) {
    txMap.set(tx.hash, tx)
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
  const celoAbiIntP = getContractAbiInterface(CeloContract.GoldToken)
  const stableTokenAbiIntP = getContractAbiInterface(CeloContract.StableToken)
  const [celoAbiInt, stableTokenAbiInt] = await Promise.all([celoAbiIntP, stableTokenAbiIntP])
  return {
    [Currency.CELO]: celoAbiInt,
    [Currency.cUSD]: stableTokenAbiInt,
  }
}

function parseTransaction(
  tx: BlockscoutTransaction | BlockscoutTokenTransaction,
  address: string,
  abiInterfaces: AbiInterfaceMap
): CeloTransaction | null {
  if (!tx || !tx.hash) {
    logger.warn('Ignoring invalid tx', JSON.stringify(tx))
  }

  if (!tx.to || !utils.isAddress(tx.to)) {
    logger.warn(`tx ${tx.hash} has invalid to field, ignoring`)
    return null
  }

  if (!tx.from || !utils.isAddress(tx.from)) {
    logger.warn(`tx ${tx.hash} has invalid from field, ignoring`)
    return null
  }

  // @ts-ignore https://github.com/microsoft/TypeScript/issues/20863
  if (tx.tokenSymbol) {
    const tokenTx = tx as BlockscoutTokenTransaction
    const symbol = tokenTx.tokenSymbol.toLowerCase()
    if (symbol === 'cusd') {
      return parseStableTokenTransfer(tokenTx, address, abiInterfaces[Currency.cUSD])
    }
    if (symbol === 'celo' || symbol === 'gold') {
      return parseCeloTokenTransfer(tokenTx, address, abiInterfaces[Currency.CELO])
    }
  }

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.StableToken])) {
    return parseOtherTokenTx(tx, abiInterfaces[Currency.cUSD])
  }

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.GoldToken])) {
    return parseOtherTokenTx(tx, abiInterfaces[Currency.CELO])
  }

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.Exchange])) {
    // TODO parse exchange
  }

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow outgoing
  }

  if (compareAddresses(tx.from, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow incoming
  }

  if (tx.value && BigNumber.from(tx.value).gt(0)) {
    return parseNativeTransferTx(tx, address)
  }

  return parseOtherTx(tx)
}

function parseStableTokenTransfer(
  tx: BlockscoutTokenTransaction,
  address: string,
  abiInterface: utils.Interface
): StableTokenTransferTx | null {
  const transfer = parseTokenTransfer(tx, address, abiInterface)
  if (!transfer) return null
  return {
    ...transfer,
    type: TransactionType.StableTokenTransfer,
  }
}

function parseCeloTokenTransfer(
  tx: BlockscoutTokenTransaction,
  address: string,
  abiInterface: utils.Interface
): CeloTokenTransferTx | null {
  const transfer = parseTokenTransfer(tx, address, abiInterface)
  if (!transfer) return null
  return {
    ...transfer,
    type: TransactionType.CeloTokenTransfer,
  }
}

function parseTokenTransfer(
  tx: BlockscoutTokenTransaction,
  address: string,
  abiInterface: utils.Interface
) {
  try {
    // Blockscout does most of the heavy lifting in decoding these
    // Still need to manually decode with ethers though because blockscout
    // doesn't include the comment
    const txDescription = abiInterface.parseTransaction({ data: tx.input })
    if (txDescription.name !== 'transfer' && txDescription.name !== 'transferWithComment') {
      throw new Error('Not a valid token transfer tx: ' + JSON.stringify(txDescription))
    }

    return {
      ...parseOtherTx(tx),
      isOutgoing: compareAddresses(tx.from, address),
      comment: txDescription.args.comment,
    }
  } catch (error) {
    logger.error('Failed to parse tx data', error, tx)
    return null
  }
}

// Parse token transactions other than transfers
// The most common would probably be 'approve' calls
function parseOtherTokenTx(tx: BlockscoutTransaction, abiInterface: utils.Interface) {
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

function parseNativeTransferTx(tx: BlockscoutTransaction, address: string): CeloNativeTransferTx {
  return {
    ...parseOtherTx(tx),
    type: TransactionType.CeloNativeTransfer,
    isOutgoing: compareAddresses(tx.from, address),
  }
}

function parseOtherTx(tx: BlockscoutTransaction): OtherTx {
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
