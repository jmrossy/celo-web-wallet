import { BigNumber, Contract } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getLatestBlockDetails, getNumBlocksPerInterval } from 'src/blockchain/blocks'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract, config } from 'src/config'
import { updatePairPrices } from 'src/features/tokenPrice/tokenPriceSlice'
import {
  PairPriceUpdate,
  QuoteCurrency,
  TokenPriceHistory,
  TokenPricePoint,
} from 'src/features/tokenPrice/types'
import { isNativeToken, NativeTokenId, NativeTokens, StableTokenIds } from 'src/tokens'
import { areAddressesEqual, ensureLeading0x } from 'src/utils/addresses'
import { fromFixidity } from 'src/utils/amount'
import {
  BlockscoutTransactionLog,
  queryBlockscout,
  validateBlockscoutLog,
} from 'src/utils/blockscout'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { areDatesSameDay } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

const DEFAULT_HISTORY_NUM_DAYS = 7
const MAX_HISTORY_NUM_DAYS = 30
const BLOCK_FETCHING_INTERVAL_SIZE = 300 // 6 minutes
const MEDIAN_UPDATED_TOPIC_0 = '0xa9981ebfc3b766a742486e898f54959b050a66006dbce1a4155c1f84a08bcf41'
const EXPECTED_MIN_CELO_TO_STABLE = 0.1
const EXPECTED_MAX_CELO_TO_STABLE = 100

interface FetchTokenPriceParams {
  baseCurrency: NativeTokenId
  quoteCurrency: QuoteCurrency
  numDays?: number // 7 by default
}

function* fetchTokenPrice(params: FetchTokenPriceParams) {
  const { baseCurrency, quoteCurrency, numDays: _numDays } = params
  const numDays = _numDays || DEFAULT_HISTORY_NUM_DAYS
  if (numDays > MAX_HISTORY_NUM_DAYS) {
    throw new Error(`Cannot retrieve prices for such a wide window: ${numDays}`)
  }
  if (baseCurrency !== NativeTokenId.CELO || !isNativeToken(quoteCurrency)) {
    throw new Error('Only CELO <-> Native currency is currently supported')
  }

  const prices = yield* select((state: RootState) => state.tokenPrice.prices)
  const basePrices = prices[baseCurrency]

  // Is data already present in store?
  if (basePrices && isPriceListComplete(basePrices[quoteCurrency], numDays)) return

  const pairPriceUpdates = yield* call(fetchStableTokenPricesFromBlockscout, numDays)
  yield* put(updatePairPrices(pairPriceUpdates))
}

export const {
  name: fetchTokenPriceSagaName,
  wrappedSaga: fetchTokenPriceSaga,
  reducer: fetchTokenPriceReducer,
  actions: fetchTokenPriceActions,
} = createMonitoredSaga<FetchTokenPriceParams>(fetchTokenPrice, 'fetchTokenPrice')

function isPriceListComplete(prices: TokenPriceHistory | undefined, numDays: number) {
  if (!prices || prices.length < numDays) return false

  // For now, this just checks to see latest entry is for today
  const latest = prices[prices.length - 1]
  const latestDate = new Date(latest.timestamp)
  const today = new Date()
  return latest.price && areDatesSameDay(latestDate, today)
}

// Fetches token prices by retrieving and parsing the oracle reporting tx logs
async function fetchStableTokenPricesFromBlockscout(numDays: number) {
  const baseUrl = config.blockscoutUrl
  const oracleContractAddress = config.contractAddresses[CeloContract.SortedOracles]
  const oracleContract = getContract(CeloContract.SortedOracles)
  const numBlocksPerDay = getNumBlocksPerInterval(86400)
  const numBlocksPerInterval = getNumBlocksPerInterval(BLOCK_FETCHING_INTERVAL_SIZE)
  const tokenToPrices = new Map<NativeTokenId, TokenPriceHistory>()

  const latestBlock = await getLatestBlockDetails()
  if (!latestBlock) throw new Error('Latest block number needed for fetching prices')

  for (let i = 0; i < numDays; i++) {
    const toBlock = latestBlock.number - numBlocksPerDay * i
    const fromBlock = toBlock - numBlocksPerInterval
    const url = `${baseUrl}/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${oracleContractAddress}&topic0=${MEDIAN_UPDATED_TOPIC_0}`
    const txLogs = await queryBlockscout<Array<BlockscoutTransactionLog>>(url)
    const tokenToPrice = parseBlockscoutOracleLogs(txLogs, oracleContract)
    // The nested loop here is awkward but helps us fetch all token prices for one day in one query
    // Just prepends the new price point to each tokens history
    for (const [id, price] of tokenToPrice) {
      if (!tokenToPrices.has(id)) tokenToPrices.set(id, [])
      tokenToPrices.get(id)!.unshift(price)
    }
  }

  const pairPriceUpdates: PairPriceUpdate[] = []
  for (const [id, prices] of tokenToPrices) {
    pairPriceUpdates.push({ baseCurrency: NativeTokenId.CELO, quoteCurrency: id, prices })
  }
  return pairPriceUpdates
}

function parseBlockscoutOracleLogs(
  logs: Array<BlockscoutTransactionLog>,
  oracleContract: Contract
) {
  const tokenToPrice = new Map<NativeTokenId, TokenPricePoint>()
  for (const id of StableTokenIds) {
    const tokenAddress = NativeTokens[id].address
    const price = parseBlockscoutOracleLogsForToken(logs, oracleContract, tokenAddress)
    if (price) tokenToPrice.set(id, price)
  }
  return tokenToPrice
}

function parseBlockscoutOracleLogsForToken(
  logs: Array<BlockscoutTransactionLog>,
  oracleContract: Contract,
  searchToken: string
): TokenPricePoint | null {
  if (!logs || !logs.length) throw new Error('No oracle logs found in time range')

  for (const log of logs) {
    try {
      validateBlockscoutLog(log, MEDIAN_UPDATED_TOPIC_0)

      const filteredTopics = log.topics.filter((t) => !!t)
      const logDescription = oracleContract.interface.parseLog({
        topics: filteredTopics,
        data: log.data,
      })

      if (logDescription.name !== 'MedianUpdated') {
        throw new Error(`Unexpected log name: ${logDescription.name}`)
      }

      const { token, value } = logDescription.args
      if (!token || !areAddressesEqual(token, searchToken)) {
        // Log is likely for a different token
        continue
      }

      const valueAdjusted = fromFixidity(value)
      if (
        valueAdjusted <= EXPECTED_MIN_CELO_TO_STABLE ||
        valueAdjusted >= EXPECTED_MAX_CELO_TO_STABLE
      ) {
        throw new Error(`Invalid median value: ${value}`)
      }

      const timestamp = BigNumber.from(ensureLeading0x(log.timeStamp)).mul(1000)
      if (timestamp.lte(0) || timestamp.gt(Date.now() + 3000)) {
        throw new Error(`Invalid timestamp: ${log.timeStamp}`)
      }

      return { timestamp: timestamp.toNumber(), price: valueAdjusted }
    } catch (error) {
      logger.error('Unable to parse log, will attempt next', error, JSON.stringify(log))
    }
  }

  logger.error(`All log parse attempts failed or no log found for token ${searchToken}`)
  return null
}
