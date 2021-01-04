import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { GAS_PRICE_STALE_TIME } from 'src/consts'
import { Currency } from 'src/currency'
import { updateGasPrice } from 'src/features/fees/feeSlice'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

export function* fetchGasPriceIfStale(feeCurrency: Currency) {
  const gasPrices = yield* select((state: RootState) => state.fees.gasPrices)
  const gasPrice = gasPrices[feeCurrency]

  if (!gasPrice || isStale(gasPrice.lastUpdated, GAS_PRICE_STALE_TIME)) {
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
  const signer = getSigner().signer

  if (!feeCurrency || feeCurrency === Currency.CELO) {
    return signer.getGasPrice()
  } else {
    const stableTokenAddress = config.contractAddresses[CeloContract.StableToken]
    return signer.getGasPrice(stableTokenAddress)
  }
}
