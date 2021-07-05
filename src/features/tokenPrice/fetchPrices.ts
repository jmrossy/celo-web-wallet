import { BigNumber, Contract } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getLatestBlockDetails, getNumBlocksPerInterval } from 'src/blockchain/blocks'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract, config } from 'src/config'
import { updatePairPrices } from 'src/features/tokenPrice/tokenPriceSlice'
import {
  PairPriceUpdate,
  QuoteCurrency,
  QuoteCurrencyPriceHistory,
  TokenPriceHistory,
  TokenPricePoint,
} from 'src/features/tokenPrice/types'
import { NativeTokenId, NativeTokens, StableTokenIds } from 'src/tokens'
import { areAddressesEqual, ensureLeading0x } from 'src/utils/addresses'
import { fromFixidity } from 'src/utils/amount'
import {
  BlockscoutTransactionLog,
  queryBlockscout,
  validateBlockscoutLog,
} from 'src/utils/blockscout'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'

const DEFAULT_HISTORY_NUM_DAYS = 7
const MAX_HISTORY_NUM_DAYS = 30
const SECONDS_PER_DAY = 86400
const BLOCK_FETCHING_INTERVAL_SIZE = 300 // 6 minutes
const MEDIAN_UPDATED_TOPIC_0 = '0xa9981ebfc3b766a742486e898f54959b050a66006dbce1a4155c1f84a08bcf41'
const EXPECTED_MIN_CELO_TO_STABLE = 0.1
const EXPECTED_MAX_CELO_TO_STABLE = 100

interface FetchTokenPriceParams {
  baseCurrency: NativeTokenId
  numDays?: number // 7 by default
}

// Currently this only fetches CELO to stable token prices
// May eventually expand to fetch other pairs
function* fetchTokenPrice(params: FetchTokenPriceParams) {
  const { baseCurrency, numDays: _numDays } = params
  const numDays = _numDays || DEFAULT_HISTORY_NUM_DAYS
  if (numDays > MAX_HISTORY_NUM_DAYS) {
    throw new Error(`Cannot retrieve prices for such a wide window: ${numDays}`)
  }
  if (baseCurrency !== NativeTokenId.CELO) {
    throw new Error('Only CELO <-> Native currency is currently supported')
  }

  const prices = yield* select((state: RootState) => state.tokenPrice.prices)
  const pairPriceUpdates = yield* call(fetchStableTokenPrices, numDays, prices[baseCurrency])
  if (pairPriceUpdates && pairPriceUpdates.length) {
    yield* put(updatePairPrices(pairPriceUpdates))
  }
}

export const {
  name: fetchTokenPriceSagaName,
  wrappedSaga: fetchTokenPriceSaga,
  reducer: fetchTokenPriceReducer,
  actions: fetchTokenPriceActions,
} = createMonitoredSaga<FetchTokenPriceParams>(fetchTokenPrice, 'fetchTokenPrice')

// Fetches token prices by retrieving and parsing the oracle reporting tx logs
async function fetchStableTokenPrices(
  numDays: number,
  prices?: Partial<QuoteCurrencyPriceHistory>
) {
  const latestBlock = await getLatestBlockDetails()
  if (!latestBlock) throw new Error('Latest block number needed for fetching prices')

  const missingDays = findMissingDays(numDays, latestBlock.number, prices)
  // Skip task if all needed days are already in store
  if (!missingDays.length) return null

  const oracleContract = getContract(CeloContract.SortedOracles)
  const numBlocksPerDay = getNumBlocksPerInterval(SECONDS_PER_DAY)
  const numBlocksPerInterval = getNumBlocksPerInterval(BLOCK_FETCHING_INTERVAL_SIZE)
  const tokenToPriceHistory = cleanupStalePriceHistory(prices)

  for (const day of missingDays) {
    const toBlock = latestBlock.number - numBlocksPerDay * day
    const fromBlock = toBlock - numBlocksPerInterval
    const tokenToPrice = await tryFetchOracleLogs(fromBlock, toBlock, oracleContract)
    if (!tokenToPrice) continue
    // The nested loop here is awkward but helps us fetch all token prices for one day in one query
    // Just prepends the new price point to each tokens history
    for (const [id, price] of tokenToPrice) {
      if (!tokenToPriceHistory.has(id)) tokenToPriceHistory.set(id, [])
      tokenToPriceHistory.get(id)!.push(price)
    }
  }

  const pairPriceUpdates: PairPriceUpdate[] = []
  for (const [id, prices] of tokenToPriceHistory) {
    pairPriceUpdates.push({ baseCurrency: NativeTokenId.CELO, quoteCurrency: id, prices })
  }
  return pairPriceUpdates
}

// Looks through the current store data to find all days for which
// price data is missing. Returns an array of days to query for
// E.g. [1,4] means days for 1 day ago and 4 days ago are needed
function findMissingDays(
  numDays: number,
  latestBlock: number,
  prices?: Partial<QuoteCurrencyPriceHistory>
) {
  const daysInData = new Map<number, boolean>()
  // This assumes if day's price for cusd exists, they all do
  // Should be true because all returned in the same blockscout query
  if (prices && prices[NativeTokenId.cUSD]) {
    prices[NativeTokenId.cUSD]?.forEach((p) => daysInData.set(p.dayIndex, true))
  }

  const currentDayIndex = getDayIndex(latestBlock)
  const missingDayList = []
  for (let i = 0; i < numDays; i++) {
    const dayIndex = currentDayIndex - i
    if (!daysInData.has(dayIndex)) missingDayList.push(i)
  }
  return missingDayList
}

// Removes token price points that are older than MAX_HISTORY_NUM_DAYS
// This prevents large amounts of data from collecting in local storage, which
// has size limits
function cleanupStalePriceHistory(prices?: Partial<QuoteCurrencyPriceHistory>) {
  const tokenToPriceHistory = new Map<QuoteCurrency, TokenPriceHistory>()
  if (!prices) return tokenToPriceHistory
  const minTimestamp = Date.now() - MAX_HISTORY_NUM_DAYS * SECONDS_PER_DAY * 1000
  for (const key of Object.keys(prices)) {
    const quoteCurrency = key as QuoteCurrency // TS limitation of Object.keys()
    const priceHistory = prices[quoteCurrency]
    if (!priceHistory) continue
    tokenToPriceHistory.set(
      quoteCurrency,
      priceHistory.filter((p) => p.timestamp > minTimestamp)
    )
  }
  return tokenToPriceHistory
}

async function tryFetchOracleLogs(fromBlock: number, toBlock: number, oracleContract: Contract) {
  try {
    const url = `${config.blockscoutUrl}/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${oracleContract.address}&topic0=${MEDIAN_UPDATED_TOPIC_0}`
    const txLogs = await queryBlockscout<Array<BlockscoutTransactionLog>>(url)
    return parseBlockscoutOracleLogs(txLogs, oracleContract, fromBlock)
  } catch (error) {
    logger.error(`Failed to fetch and parse oracle logs for blocks ${fromBlock}-${toBlock}`, error)
    return null
  }
}

function parseBlockscoutOracleLogs(
  logs: Array<BlockscoutTransactionLog>,
  oracleContract: Contract,
  minBlock: number
) {
  const tokenToPrice = new Map<NativeTokenId, TokenPricePoint>()
  for (const id of StableTokenIds) {
    const tokenAddress = NativeTokens[id].address
    const price = parseBlockscoutOracleLogsForToken(logs, oracleContract, tokenAddress, minBlock)
    if (price) tokenToPrice.set(id, price)
  }
  return tokenToPrice
}

function parseBlockscoutOracleLogsForToken(
  logs: Array<BlockscoutTransactionLog>,
  oracleContract: Contract,
  searchToken: string,
  minBlock: number
): TokenPricePoint | null {
  if (!logs || !logs.length) throw new Error('No oracle logs found in time range')

  for (const log of logs) {
    try {
      validateBlockscoutLog(log, MEDIAN_UPDATED_TOPIC_0, minBlock)

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
      if (timestamp.lte(0) || timestamp.gt(Date.now() + 600000)) {
        throw new Error(`Invalid timestamp: ${log.timeStamp}`)
      }

      const blockNumber = BigNumber.from(log.blockNumber).toNumber()
      const dayIndex = getDayIndex(blockNumber)

      return { timestamp: timestamp.toNumber(), dayIndex, price: valueAdjusted }
    } catch (error) {
      // Note: this creates some noise atm because of a blockscout bug
      // that's returning garbage with the API responses
      logger.warn('Unable to parse log, will attempt next', error)
    }
  }

  logger.error(`All log parse attempts failed or no log found for token ${searchToken}`)
  return null
}

// Because the queries must be done by block number
// and the block times are not perfectly consistent,
// instead of date, the prices are matched to 'day indexes'
// which are factors of
function getDayIndex(blockNumber: number) {
  const numBlocksPerDay = getNumBlocksPerInterval(SECONDS_PER_DAY)
  return Math.floor(blockNumber / numBlocksPerDay)
}
