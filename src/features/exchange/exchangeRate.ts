import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { EXCHANGE_RATE_STALE_TIME, WEI_PER_UNIT } from 'src/consts'
import { setCeloExchangeRate, setUsdExchangeRate } from 'src/features/exchange/exchangeSlice'
import { ExchangeRate } from 'src/features/exchange/types'
import { fromWei } from 'src/utils/amount'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

interface FetchExchangeRateParams {
  sellGold?: boolean
  sellAmount?: string
  force?: boolean // Fetch regardless of staleness
  getUsdRate?: boolean
}

function* fetchExchangeRate({ sellGold, sellAmount, force, getUsdRate }: FetchExchangeRateParams) {
  // Clear existing exchange rate to ensure UI don't allow proceeding with stale rate
  if (force) {
    yield* put(setCeloExchangeRate(null))
    if (getUsdRate) {
      yield* put(setUsdExchangeRate(null))
    }
  }

  let { cUsdToCelo, cUsdToUsd } = yield* select((state: RootState) => state.exchange)

  if (isRateStale(cUsdToCelo)) {
    cUsdToCelo = yield* call(fetchCeloExchangeRate, sellGold, sellAmount)
    yield* put(setCeloExchangeRate(cUsdToCelo))
  }

  if (getUsdRate && isRateStale(cUsdToUsd)) {
    cUsdToUsd = yield* call(fetchUsdExchangeRate)
    yield* put(setUsdExchangeRate(cUsdToUsd))
  }

  return { cUsdToCelo, cUsdToUsd }
}

export const {
  name: fetchExchangeRateSagaName,
  wrappedSaga: fetchExchangeRateSaga,
  reducer: fetchExchangeRateReducer,
  actions: fetchExchangeRateActions,
} = createMonitoredSaga<FetchExchangeRateParams>(fetchExchangeRate, 'fetchExchangeRate')

async function fetchCeloExchangeRate(
  _sellGold?: boolean,
  _sellAmount?: string
): Promise<ExchangeRate> {
  const sellGold = _sellGold || false
  const sellAmount = _sellAmount || WEI_PER_UNIT

  const exchange = getContract(CeloContract.Exchange)
  const buyAmount = await exchange.getBuyTokenAmount(sellAmount, sellGold)

  // Example:
  // sellGold: false (i.e. buying gold with cUSD)
  // sellAmount: 2 cUSD
  // buyAmount: 0.2 CELO
  // toCeloRate should be 0.1
  const toCeloRate = sellGold
    ? fromWei(sellAmount) / fromWei(buyAmount)
    : fromWei(buyAmount) / fromWei(sellAmount)

  return { rate: toCeloRate, lastUpdated: Date.now() }
}

async function fetchUsdExchangeRate(): Promise<ExchangeRate> {
  // TODO

  // const usdRate = await exchange.getOracleExchangeRate(sellAmount, sellGold)
  const cUsdToUsd = { rate: 0, lastUpdated: Date.now() }

  return cUsdToUsd
}

function isRateStale(rate: ExchangeRate | null) {
  return !rate || isStale(rate.lastUpdated, EXCHANGE_RATE_STALE_TIME) || rate.rate <= 0
}
