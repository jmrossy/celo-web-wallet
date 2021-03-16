import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { GAS_PRICE_STALE_TIME } from 'src/consts'
import { updateGasPrice } from 'src/features/fees/feeSlice'
import { NativeTokenId } from 'src/tokens'
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
  const signer = getSigner().signer

  if (!feeToken || feeToken === NativeTokenId.CELO) {
    return signer.getGasPrice()
  } else {
    // TODO cEUR
    const stableTokenAddress = config.contractAddresses[CeloContract.StableToken]
    return signer.getGasPrice(stableTokenAddress)
  }
}
