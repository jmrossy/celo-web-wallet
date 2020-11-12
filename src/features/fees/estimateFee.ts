import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { Currency } from 'src/consts'
import { estimateGas } from 'src/features/fees/estimateGas'
import { setFeeEstimate } from 'src/features/fees/feeSlice'
import { fetchGasPriceIfStale } from 'src/features/fees/gasPrice'
import { isCeloTransfer, TransactionType } from 'src/features/types'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

interface EstimateFeeParams {
  type: TransactionType
  tx?: CeloTransactionRequest
  forceGasEstimation?: boolean
}

function* estimateFee(params: EstimateFeeParams) {
  const { type, tx, forceGasEstimation: force } = params

  // Clear fee while new few is computed
  yield* put(setFeeEstimate(null))

  const { celo: celoBalanceStr } = yield* call(fetchBalancesIfStale)

  // Try to compute fee with CELO first
  const celoBalance = BigNumber.from(celoBalanceStr)
  if (!celoBalance.isZero() || isCeloTransfer(type)) {
    const { gasLimit, gasPrice, fee } = yield* call(calculateFee, type, Currency.CELO, tx, force)

    if (celoBalance.gte(fee) || isCeloTransfer(type)) {
      yield* put(setFeeEstimate({ gasLimit, gasPrice, fee, currency: Currency.CELO }))
      return
    }
  }

  // Otherwise try cUSD
  const { gasLimit, gasPrice, fee } = yield* call(calculateFee, type, Currency.cUSD, tx, force)
  yield* put(setFeeEstimate({ gasLimit, gasPrice, fee, currency: Currency.cUSD }))
}

export const {
  wrappedSaga: estimateFeeSaga,
  reducer: estimateFeeReducer,
  actions: estimateFeeActions,
} = createMonitoredSaga<EstimateFeeParams>(estimateFee, 'estimateFee')

function* calculateFee(
  type: TransactionType,
  currency: Currency,
  tx?: CeloTransactionRequest,
  forceGasEstimation?: boolean
) {
  // Otherwise try cUSD
  const gasLimit = yield* call(estimateGas, type, tx, currency, forceGasEstimation)
  const gasPrice = yield* call(fetchGasPriceIfStale, currency)
  // TODO add gateway fee here
  const fee = BigNumber.from(gasPrice).mul(gasLimit)
  return {
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice.toString(),
    fee: fee.toString(),
  }
}
