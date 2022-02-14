import { BigNumber } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { GAS_PRICE_STALE_TIME } from 'src/consts'
import { updateGasPrice } from 'src/features/fees/feeSlice'
import { isNativeToken } from 'src/features/tokens/utils'
import { NativeTokenId, NativeTokens } from 'src/tokens'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

export function* fetchGasPriceIfStale(feeToken: NativeTokenId) {
  const gasPrices = yield* select((state: RootState) => state.fees.gasPrices)
  const gasPrice = gasPrices[feeToken]

  if (!gasPrice || isStale(gasPrice.lastUpdated, GAS_PRICE_STALE_TIME)) {
    const price = yield* call(fetchGasPrice, feeToken)
    yield* put(
      updateGasPrice({ token: feeToken, value: price.toString(), lastUpdated: Date.now() })
    )
    return price
  } else {
    return BigNumber.from(gasPrice.value)
  }
}

function fetchGasPrice(feeToken: NativeTokenId) {
  const provider = getProvider()

  if (!feeToken || feeToken === NativeTokenId.CELO) {
    return provider.getGasPrice()
  } else if (isNativeToken(feeToken)) {
    const feeCurrencyAddress = NativeTokens[feeToken].address
    return provider.getGasPrice(feeCurrencyAddress)
  } else {
    throw new Error(`Cannot fetch gas price with non-native token ${feeToken}`)
  }
}
