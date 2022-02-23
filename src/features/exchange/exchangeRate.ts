import { BigNumber, BigNumberish } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getContractByAddress } from 'src/blockchain/contracts'
import { EXCHANGE_RATE_STALE_TIME, MAX_EXCHANGE_SPREAD } from 'src/consts'
import { resetExchangeRates, setExchangeRates } from 'src/features/exchange/exchangeSlice'
import { ExchangeRate, ToCeloRates } from 'src/features/exchange/types'
import { StableTokens, Token } from 'src/tokens'
import { fromFixidity } from 'src/utils/amount'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put } from 'typed-redux-saga'

interface FetchExchangeRateParams {
  force?: boolean // Fetch regardless of staleness
}

function* fetchExchangeRate({ force }: FetchExchangeRateParams) {
  if (force) {
    // Clear existing rates to ensure UI prevents proceeding with stale rates
    yield* put(resetExchangeRates())
  }

  const toCeloRates = yield* appSelect((state) => state.exchange.toCeloRates)

  if (areRatesStale(toCeloRates)) {
    const newToCeloRates: ToCeloRates = {}
    for (const token of StableTokens) {
      const rate = yield* call(fetchCeloExchangeRate, token)
      newToCeloRates[token.address] = rate
    }
    yield* put(setExchangeRates(newToCeloRates))
    return newToCeloRates
  } else {
    return toCeloRates
  }
}

export const {
  name: fetchExchangeRateSagaName,
  wrappedSaga: fetchExchangeRateSaga,
  reducer: fetchExchangeRateReducer,
  actions: fetchExchangeRateActions,
} = createMonitoredSaga<FetchExchangeRateParams>(fetchExchangeRate, 'fetchExchangeRate')

async function fetchCeloExchangeRate(stableToken: Token): Promise<ExchangeRate> {
  const exchangeAddress = stableToken.exchangeAddress
  if (!exchangeAddress) throw new Error(`Token ${stableToken.symbol} has no known exchange address`)
  const exchangeContract = getContractByAddress(exchangeAddress)
  if (!exchangeContract) throw new Error(`No exchange contract found for ${stableToken.symbol}`)

  const spreadP: Promise<BigNumberish> = exchangeContract.spread()
  const bucketsP: Promise<[BigNumberish, BigNumberish]> =
    exchangeContract.getBuyAndSellBuckets(false)
  const [spreadRaw, bucketsRaw] = await Promise.all([spreadP, bucketsP])

  const spread = fromFixidity(spreadRaw)
  if (spread <= 0 || spread > MAX_EXCHANGE_SPREAD)
    throw new Error(`Invalid exchange spread: ${spread}`)

  const [celoBucketRaw, stableBucketRaw] = bucketsRaw
  const celoBucket = BigNumber.from(celoBucketRaw)
  const stableBucket = BigNumber.from(stableBucketRaw)
  if (celoBucket.lte(0) || stableBucket.lte(0))
    throw new Error(
      `Invalid exchange buckets: ${celoBucket.toString()}, ${stableBucket.toString()}`
    )

  return {
    celoBucket: celoBucket.toString(),
    stableBucket: stableBucket.toString(),
    spread: spread.toString(),
    lastUpdated: Date.now(),
  }
}

function areRatesStale(rates: ToCeloRates) {
  return (
    !rates ||
    !Object.keys(rates).length ||
    Object.values(rates).some((r) => isStale(r.lastUpdated, EXCHANGE_RATE_STALE_TIME))
  )
}
