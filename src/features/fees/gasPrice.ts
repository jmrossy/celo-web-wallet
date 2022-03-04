import { BigNumber } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getProvider } from 'src/blockchain/provider'
import { GAS_PRICE_STALE_TIME } from 'src/consts'
import { updateGasPrice } from 'src/features/fees/feeSlice'
import { isNativeTokenAddress } from 'src/features/tokens/utils'
import { CELO } from 'src/tokens'
import { areAddressesEqual } from 'src/utils/addresses'
import { isStale } from 'src/utils/time'
import { call, put } from 'typed-redux-saga'

export function* fetchGasPriceIfStale(feeToken: Address) {
  const gasPrices = yield* appSelect((state) => state.fees.gasPrices)
  const gasPrice = gasPrices[feeToken]

  if (!gasPrice || isStale(gasPrice.lastUpdated, GAS_PRICE_STALE_TIME)) {
    const price = yield* call(fetchGasPrice, feeToken)
    yield* put(updateGasPrice({ feeToken, value: price.toString(), lastUpdated: Date.now() }))
    return price
  } else {
    return BigNumber.from(gasPrice.value)
  }
}

function fetchGasPrice(feeToken: Address) {
  const provider = getProvider()

  if (!feeToken || areAddressesEqual(feeToken, CELO.address)) {
    return provider.getGasPrice()
  } else if (isNativeTokenAddress(feeToken)) {
    return provider.getGasPrice(feeToken)
  } else {
    throw new Error(`Cannot fetch gas price with non-native token ${feeToken}`)
  }
}
