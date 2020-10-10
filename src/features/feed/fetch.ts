import { BigNumber, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { CeloContract, config } from 'src/config'
import { addTransactions } from 'src/features/feed/feedSlice'
import {
  CeloTokenTransferTx,
  CeloTransaction,
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
  const { txList, tokenTxList } = await fetchTxsFromBlockscout(address, lastBlockNumber)

  console.log(txList)
  console.log(tokenTxList)
  const newTransactions: TransactionMap = {}
  let newLastBlockNumber = lastBlockNumber || 0

  // TODO parse the tokenTxs too, likely needed to be handled slightly differently
  for (const tx of txList) {
    const parsedTx = parseTransaction(tx)
    if (!parsedTx) continue
    newTransactions[parsedTx.hash] = parsedTx
    newLastBlockNumber = Math.max(BigNumber.from(tx.blockNumber).toNumber(), newLastBlockNumber)
  }

  return { newTransactions, newLastBlockNumber }
}

async function fetchTxsFromBlockscout(address: string, lastBlockNumber: number | null) {
  // TODO consider pagination here

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

  return { txList, tokenTxList }
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

function parseTransaction(tx: BlockscoutTransaction): CeloTransaction | null {
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

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.StableToken])) {
    return parseStableTokenTransfer(tx, true)
  }

  if (compareAddresses(tx.from, config.contractAddresses[CeloContract.StableToken])) {
    return parseStableTokenTransfer(tx, false)
  }

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.GoldToken])) {
    return parseCeloTokenTransfer(tx, true)
  }

  if (compareAddresses(tx.from, config.contractAddresses[CeloContract.GoldToken])) {
    return parseCeloTokenTransfer(tx, false)
  }

  // TODO figure out how to detect and label simple gold transfers

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.Exchange])) {
    // TODO parse exchange
  }

  if (compareAddresses(tx.to, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow outgoing
  }

  if (compareAddresses(tx.from, config.contractAddresses[CeloContract.Escrow])) {
    // TODO parse escrow incoming
  }

  return parseOtherTx(tx)
}

function parseStableTokenTransfer(
  tx: BlockscoutTransaction,
  isOutgoing: boolean
): StableTokenTransferTx | null {
  const transfer = parseTokenTransfer(tx, isOutgoing)
  if (!transfer) return null
  return {
    ...transfer,
    type: TransactionType.StableTokenTransfer,
  }
}

function parseCeloTokenTransfer(
  tx: BlockscoutTransaction,
  isOutgoing: boolean
): CeloTokenTransferTx | null {
  const transfer = parseTokenTransfer(tx, isOutgoing)
  if (!transfer) return null
  return {
    ...transfer,
    type: TransactionType.CeloTokenTransfer,
  }
}

function parseTokenTransfer(tx: BlockscoutTransaction, isOutgoing: boolean) {
  try {
    // TODO check if separate ABI is needed for goldToken?
    const abiInterface = getContractAbiInterface(CeloContract.StableToken)
    const txDescription = abiInterface.parseTransaction({ data: tx.input, value: tx.value })
    console.log(txDescription)
    if (txDescription.name !== 'transfer' && txDescription.name !== 'transferWithComment') {
      throw new Error('Unsupported token transfer method: ' + JSON.stringify(txDescription))
    }

    if (!txDescription.args.to || !txDescription.args.value) {
      throw new Error('Invalid tx description args: ' + JSON.stringify(txDescription.args))
    }

    return {
      isOutgoing,
      hash: tx.hash,
      from: tx.from,
      to: txDescription.args.to,
      value: txDescription.args.value.toString(),
      comment: txDescription.args.comment,
      blockNumber: BigNumber.from(tx.blockNumber).toNumber(),
      timestamp: BigNumber.from(tx.timeStamp).toNumber(),
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
    }
  } catch (error) {
    logger.error('Failed to parse input data', error, tx)
    return null
  }
}

function parseOtherTx(tx: BlockscoutTransaction) {
  //TODO
  return null
}
