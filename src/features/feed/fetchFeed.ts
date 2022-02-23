import { BigNumber } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getContract } from 'src/blockchain/contracts'
import { isSignerSet } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { fetchBalancesActions } from 'src/features/balances/fetchBalances'
import { addTransactions } from 'src/features/feed/feedSlice'
import { isValidTransaction, parseTransaction } from 'src/features/feed/parseFeedTransaction'
import {
  AbiInterfaceMap,
  BlockscoutTokenTransfer,
  BlockscoutTx,
  BlockscoutTxBase,
} from 'src/features/feed/types'
import { addTokensByAddress } from 'src/features/tokens/addToken'
import { TokenMap } from 'src/features/tokens/types'
import { TransactionMap, TransactionType } from 'src/features/types'
import { saveFeedData } from 'src/features/wallet/manager'
import { StableTokens } from 'src/tokens'
import { queryBlockscout } from 'src/utils/blockscout'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put } from 'typed-redux-saga'

const QUERY_DEBOUNCE_TIME = 2000 // 2 seconds

function* fetchFeed() {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address || !isSignerSet()) return

  const lastUpdatedTime = yield* appSelect((state) => state.feed.lastUpdatedTime)
  if (!isStale(lastUpdatedTime, QUERY_DEBOUNCE_TIME)) return

  const lastBlockNumber = yield* appSelect((state) => state.feed.lastBlockNumber)
  const tokensByAddress = yield* appSelect((state) => state.tokens.byAddress)

  const { newTransactions, newLastBlockNumber } = yield* call(
    doFetchFeed,
    address,
    tokensByAddress,
    lastBlockNumber
  )
  yield* put(
    addTransactions({
      txs: newTransactions,
      lastUpdatedTime: Date.now(),
      lastBlockNumber: newLastBlockNumber,
    })
  )

  if (!Object.keys(newTransactions).length) return

  yield* call(saveFeedData, address)
  yield* call(addNewTokens, newTransactions, tokensByAddress)
  yield* put(fetchBalancesActions.trigger())
}

export const {
  name: fetchFeedSagaName,
  wrappedSaga: fetchFeedSaga,
  reducer: fetchFeedReducer,
  actions: fetchFeedActions,
} = createMonitoredSaga(fetchFeed, 'fetchFeed')

async function doFetchFeed(
  address: Address,
  tokensByAddress: TokenMap,
  lastBlockNumber: number | null
) {
  const txList = await fetchTxsFromBlockscout(address, lastBlockNumber)

  const exchangesByAddress = getExchangeAddresses()
  const abiInterfaces = getAbiInterfacesForParsing()

  const newTransactions: TransactionMap = {}
  let newLastBlockNumber = lastBlockNumber || 0

  for (const tx of txList) {
    if (!isValidTransaction(tx)) continue
    newLastBlockNumber = Math.max(BigNumber.from(tx.blockNumber).toNumber(), newLastBlockNumber)
    const parsedTx = parseTransaction(
      tx,
      address,
      tokensByAddress,
      exchangesByAddress,
      abiInterfaces
    )
    if (parsedTx) newTransactions[parsedTx.hash] = parsedTx
  }

  // TODO consider setting newLastBlockNumber to roughly current block
  // to make subsequent queries smaller for blockscout
  return { newTransactions, newLastBlockNumber }
}

async function fetchTxsFromBlockscout(address: Address, lastBlockNumber: number | null) {
  // TODO consider pagination here

  // First fetch the basic tx list, which includes outgoing token transfers
  let txQueryUrl = config.blockscoutUrl + '/api?module=account&action=txlist&address=' + address
  if (lastBlockNumber) {
    txQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const txList = await queryBlockscout<Array<BlockscoutTx>>(txQueryUrl)

  // The txlist query alone doesn't get all needed transactions
  // It excludes incoming token transfers so we need a second query to cover those
  // TODO better handle case where tokenTx for given tx isn't available yet
  // Blockscout tends to need more time with those
  let tokenTxQueryUrl =
    config.blockscoutUrl + '/api?module=account&action=tokentx&address=' + address
  if (lastBlockNumber) {
    tokenTxQueryUrl += `&startblock=${lastBlockNumber + 1}`
  }
  const tokenTxList = await queryBlockscout<Array<BlockscoutTokenTransfer>>(tokenTxQueryUrl)

  // Create a map of hash to txs
  const txMap = new Map<string, BlockscoutTx>()
  for (const tx of txList) {
    txMap.set(tx.hash, tx)
  }

  //  Attach the token transfers to their parent txs in the first list
  for (const tx of tokenTxList) {
    // If transfer doesn't have a corresponding tx from the first list, make a placeholder
    // Most common reason would be incoming token transfer
    if (!txMap.has(tx.hash)) {
      txMap.set(tx.hash, copyTx(tx))
    }

    const parentTx = txMap.get(tx.hash)!
    if (!parentTx.tokenTransfers) {
      parentTx.tokenTransfers = []
    }
    parentTx.tokenTransfers.push(tx)
  }
  return txMap.values()
}

function getExchangeAddresses() {
  const exchangesByAddress: TokenMap = {} // Mento address to token info
  for (const token of StableTokens) {
    if (token.exchangeAddress) {
      exchangesByAddress[token.exchangeAddress] = token
    }
  }
  return exchangesByAddress
}

function getAbiInterfacesForParsing(): AbiInterfaceMap {
  const goldTokenContract = getContract(CeloContract.GoldToken)
  const stableTokenContract = getContract(CeloContract.StableToken)
  const exchangeContract = getContract(CeloContract.Exchange)
  const escrowContract = getContract(CeloContract.Escrow)
  const lockedGoldContract = getContract(CeloContract.LockedGold)
  const electionContract = getContract(CeloContract.Election)
  const governanceContract = getContract(CeloContract.Governance)

  return {
    [CeloContract.GoldToken]: goldTokenContract.interface,
    [CeloContract.StableToken]: stableTokenContract.interface,
    [CeloContract.Exchange]: exchangeContract.interface,
    [CeloContract.Escrow]: escrowContract.interface,
    [CeloContract.LockedGold]: lockedGoldContract.interface,
    [CeloContract.Election]: electionContract.interface,
    [CeloContract.Governance]: governanceContract.interface,
  }
}

function copyTx(tx: BlockscoutTxBase): BlockscoutTx {
  // Don't just use destructuring here because extra fields
  // should be filtered out
  return {
    hash: tx.hash,
    value: tx.value,
    from: tx.from,
    to: tx.to,
    input: tx.input,
    gas: tx.gas,
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    feeCurrency: tx.feeCurrency,
    gatewayFee: tx.gatewayFee,
    gatewayFeeRecipient: tx.gatewayFeeRecipient,
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

function* addNewTokens(newTransactions: TransactionMap, tokensByAddress: TokenMap) {
  try {
    const currentTokenAddrs = new Set<Address>(Object.keys(tokensByAddress))
    const newTokenAddrs = new Set<Address>()
    for (const tx of Object.values(newTransactions)) {
      if (
        (tx.type === TransactionType.OtherTokenTransfer ||
          tx.type === TransactionType.OtherTokenApprove) &&
        !currentTokenAddrs.has(tx.tokenId) // Note: tokenId is address
      ) {
        newTokenAddrs.add(tx.tokenId)
      }
    }
    yield* call(addTokensByAddress, newTokenAddrs)
  } catch (error) {
    // Not an essential function, don't propagate errors
    logger.error('Error when finding and adding new tokens from feed', error)
  }
}
