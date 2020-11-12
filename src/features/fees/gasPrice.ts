import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/consts'
import { updateGasPrice } from 'src/features/fees/feeSlice'
import { call, put, select } from 'typed-redux-saga'

const GAS_PRICE_STALE_TIME = 10000 // 10 seconds

export function* fetchGasPriceIfStale(feeCurrency: Currency) {
  const gasPrices = yield* select((state: RootState) => state.fees.gasPrices)
  const gasPrice = gasPrices[feeCurrency]

  if (!gasPrice || Date.now() - gasPrice.lastUpdated > GAS_PRICE_STALE_TIME) {
    const price = yield* call(fetchGasPrice, feeCurrency)
    yield* put(
      updateGasPrice({ currency: feeCurrency, value: price.toString(), lastUpdated: Date.now() })
    )
    return price
  } else {
    return BigNumber.from(gasPrice.value)
  }
}

function fetchGasPrice(feeCurrency: Currency) {
  const signer = getSigner()

  if (!feeCurrency || feeCurrency === Currency.CELO) {
    return signer.getGasPrice()
  } else {
    const stableTokenAddress = config.contractAddresses[CeloContract.StableToken]
    return signer.getGasPrice(stableTokenAddress)
  }
}
