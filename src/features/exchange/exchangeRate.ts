import { BigNumber, BigNumberish } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContractByAddress } from 'src/blockchain/contracts'
import { EXCHANGE_RATE_STALE_TIME } from 'src/consts'
import { resetExchangeRates, setExchangeRates } from 'src/features/exchange/exchangeSlice'
import { ExchangeRate, ToCeloRates } from 'src/features/exchange/types'
import { NativeTokens, StableTokenIds, Token } from 'src/tokens'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

interface FetchExchangeRateParams {
  force?: boolean // Fetch regardless of staleness
}

function* fetchExchangeRate({ force }: FetchExchangeRateParams) {
  if (force) {
    // Clear existing rates to ensure UI prevents proceeding with stale rates
    yield* put(resetExchangeRates())
  }

  const toCeloRates = yield* select((state: RootState) => state.exchange.toCeloRates)

  if (areRatesStale(toCeloRates)) {
    const newToCeloRates: ToCeloRates = {}
    for (const tokenId of StableTokenIds) {
      const token = NativeTokens[tokenId]
      const rate = yield* call(fetchCeloExchangeRate, token)
      newToCeloRates[tokenId] = rate
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
  // const sellGold = _sellGold || false
  // const sellAmount = _sellAmount || WEI_PER_UNIT
  const exchangeAddress = stableToken.exchangeAddress
  if (!exchangeAddress) throw new Error(`Token ${stableToken.id} has no known exchange address`)
  const exchangeContract = getContractByAddress(exchangeAddress)
  if (!exchangeContract) throw new Error(`No exchange contract found for ${stableToken.id}`)

  const spreadP: Promise<BigNumberish> = exchangeContract.spread()
  const bucketsP: Promise<[BigNumberish, BigNumberish]> = exchangeContract.getBuyAndSellBuckets(
    true
  )
  const [spreadBN, bucketsBN] = await Promise.all([spreadP, bucketsP])
  const spread = BigNumber.from(spreadBN).toString()
  const [stableBucketBN, celoBucketBN] = bucketsBN
  const stableBucket = BigNumber.from(stableBucketBN).toString()
  const celoBucket = BigNumber.from(celoBucketBN).toString()

  // TODO add some checks here
  console.log('spread', spread)
  console.log('stable', BigNumber.from(stableBucket).toString())
  console.log('gold', BigNumber.from(celoBucket).toString())
  // const buyAmount = await exchange.getBuyTokenAmount(sellAmount, sellGold)

  // // Example:
  // // sellGold: false (i.e. buying gold with cUSD)
  // // sellAmount: 2 cUSD
  // // buyAmount: 0.2 CELO
  // // toCeloRate should be 0.1
  // const toCeloRate = sellGold
  //   ? fromWei(sellAmount) / fromWei(buyAmount)
  //   : fromWei(buyAmount) / fromWei(sellAmount)

  return { stableBucket, celoBucket, spread, lastUpdated: Date.now() }
}

function areRatesStale(rates: ToCeloRates) {
  return (
    !rates ||
    !Object.keys(rates).length ||
    Object.values(rates).some((r) => isStale(r.lastUpdated, EXCHANGE_RATE_STALE_TIME))
  )
}
