import { BigNumber, Contract } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getLatestBlockDetails, getNumBlocksPerInterval } from 'src/blockchain/blocks'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/currency'
import { updatePairPrice } from 'src/features/tokenPrice/tokenPriceSlice'
import { QuoteCurrency, TokenPriceHistory } from 'src/features/tokenPrice/types'
import { areAddressesEqual } from 'src/utils/addresses'
import { fromFixidity } from 'src/utils/amount'
import { queryBlockscout } from 'src/utils/blockscout'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { areDatesSameDay } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

const DEFAULT_HISTORY_NUM_DAYS = 7
const MAX_HISTORY_NUM_DAYS = 30
const BLOCK_FETCHING_INTERVAL_SIZE = 300 // 6 minutes
const MEDIAN_UPDATED_TOPIC_0 = '0xa9981ebfc3b766a742486e898f54959b050a66006dbce1a4155c1f84a08bcf41'
const EXPECTED_MIN_CELO_TO_USD = 0.1
const EXPECTED_MAX_CELO_TO_USD = 100

interface FetchTokenPriceParams {
  baseCurrency: Currency
  quoteCurrency: QuoteCurrency
  numDays?: number // 7 by default
}

function* fetchTokenPrice(params: FetchTokenPriceParams) {
  const { baseCurrency, quoteCurrency, numDays: _numDays } = params
  const numDays = _numDays || DEFAULT_HISTORY_NUM_DAYS

  const prices = yield* select((state: RootState) => state.tokenPrice.prices)
  const pairPrices = prices[baseCurrency][quoteCurrency]

  // Is data already present in store?
  if (isPriceListComplete(pairPrices, numDays)) return

  const newPrices = yield* call(fetchTokenPriceFromBlockscout, baseCurrency, quoteCurrency, numDays)
  yield* put(updatePairPrice({ baseCurrency, quoteCurrency, prices: newPrices }))
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

interface TransactionLog {
  transactionIndex: string
  transactionHash: string
  topics: Array<string>
  timeStamp: string
  logIndex: string
  gatewayFeeRecipient: string
  gatewayFee: string
  gasUsed: string
  gasPrice: string
  feeCurrency: string
  data: string
  blockNumber: string
  address: string
}

// Fetches token prices by retrieving and parsing the oracle reporting tx logs
async function fetchTokenPriceFromBlockscout(
  baseCurrency: Currency,
  quoteCurrency: QuoteCurrency,
  numDays: number
): Promise<TokenPriceHistory> {
  if (baseCurrency !== Currency.CELO || quoteCurrency !== QuoteCurrency.USD) {
    throw new Error('Only CELO <-> USD is currently supported')
  }

  if (numDays > MAX_HISTORY_NUM_DAYS) {
    throw new Error(`Cannot retrieve prices for such a wide window: ${numDays}`)
  }

  const baseUrl = config.blockscoutUrl
  const oracleContractAddress = config.contractAddresses[CeloContract.SortedOracles]
  const oracleContract = getContract(CeloContract.SortedOracles)
  const numBlocksPerDay = getNumBlocksPerInterval(86400)
  const numBlocksPerInterval = getNumBlocksPerInterval(BLOCK_FETCHING_INTERVAL_SIZE)
  const prices: TokenPriceHistory = []

  const latestBlock = await getLatestBlockDetails()
  if (!latestBlock) {
    throw new Error('Latest block number needed for fetching prices')
  }

  for (let i = 0; i < numDays; i++) {
    const toBlock = latestBlock.number - numBlocksPerDay * i
    const fromBlock = toBlock - numBlocksPerInterval
    const url = `${baseUrl}/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${oracleContractAddress}&topic0=${MEDIAN_UPDATED_TOPIC_0}`
    const txLogs = await queryBlockscout<Array<TransactionLog>>(url)
    prices.unshift(parseBlockscoutOracleLogs(txLogs, oracleContract))
  }

  return prices
}

function parseBlockscoutOracleLogs(logs: Array<TransactionLog>, oracleContract: Contract) {
  if (!logs || !logs.length) {
    throw new Error('No oracle logs found in time range')
  }

  const stableTokenAddress = config.contractAddresses[CeloContract.StableToken]

  for (const log of logs) {
    try {
      validateBlockscoutOracleLog(log)

      const filteredTopics = log.topics.filter((t) => !!t)
      const logDescription = oracleContract.interface.parseLog({
        topics: filteredTopics,
        data: log.data,
      })

      if (logDescription.name !== 'MedianUpdated') {
        throw new Error(`Unexpected log name: ${logDescription.name}`)
      }

      const { token, value } = logDescription.args
      if (!token || !areAddressesEqual(token, stableTokenAddress)) {
        throw new Error(`Invalid token arg in log: ${token}`)
      }

      const valueAdjusted = fromFixidity(value)
      if (valueAdjusted <= EXPECTED_MIN_CELO_TO_USD || valueAdjusted >= EXPECTED_MAX_CELO_TO_USD) {
        throw new Error(`Invalid median value: ${value}`)
      }

      const timestamp = BigNumber.from('0x' + log.timeStamp).mul(1000)
      if (timestamp.lte(0) || timestamp.gt(Date.now() + 3000)) {
        throw new Error(`Invalid timestamp: ${log.timeStamp}`)
      }

      return { timestamp: timestamp.toNumber(), price: valueAdjusted }
    } catch (error) {
      logger.error('Unable to parse log, will attempt next', error, JSON.stringify(log))
    }
  }

  throw new Error('All attempts at log parsing failed')
}

function validateBlockscoutOracleLog(log: TransactionLog) {
  if (!log) throw new Error('Oracle log is nullish')
  if (!log.transactionHash) throw new Error('Oracle log has no tx hash')
  if (!log.topics || !log.topics.length) throw new Error('Oracle log has no topics')
  if (!log.topics || !log.topics.length) throw new Error('Oracle log has no topics')
  if (log.topics[0]?.toLowerCase() !== MEDIAN_UPDATED_TOPIC_0)
    throw new Error('Oracle log topic is incorrect')
  if (!log.data) throw new Error('Oracle log has no data to parse')
  if (!log.timeStamp) throw new Error('Oracle log has no timestamp')
}
