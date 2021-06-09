import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { estimateGas } from 'src/features/fees/estimateGas'
import { setFeeEstimate } from 'src/features/fees/feeSlice'
import { resolveTokenPreferenceOrder } from 'src/features/fees/feeTokenOrder'
import { fetchGasPriceIfStale } from 'src/features/fees/gasPrice'
import { FeeEstimate } from 'src/features/fees/types'
import { TransactionType } from 'src/features/types'
import { fetchBalancesIfStale } from 'src/features/wallet/balances/fetchBalances'
import { NativeTokenId } from 'src/tokens'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

interface EstimateFeeParams {
  txs: Array<{ type: TransactionType; tx?: CeloTransactionRequest }>
  forceGasEstimation?: boolean
  preferredToken?: NativeTokenId
  txToken?: NativeTokenId
}

function* estimateFee(params: EstimateFeeParams) {
  // Clear fee while new few is computed
  yield* put(setFeeEstimate(null))

  const balances = yield* call(fetchBalancesIfStale)

  const { txs, forceGasEstimation: force, preferredToken, txToken } = params
  if (!txs || !txs.length) throw new Error('No txs provided for fee estimation')

  const preferenceOrder = resolveTokenPreferenceOrder(balances, preferredToken, txToken)

  // Check all tokens in order of preference to find
  // one that can afford the fee
  let firstEstimate: FeeEstimate[] | null = null
  for (let i = 0; i < preferenceOrder.length; i++) {
    const token = preferenceOrder[i]
    const tokenBal = BigNumber.from(balances.tokens[token].value)
    // If there's no balance and its not the first preference token, skip
    if (tokenBal.lte(0) && i !== 0) continue
    const result = yield* call(calculateFee, token, txs, force)
    if (result.totalFee.lte(tokenBal)) {
      yield* put(setFeeEstimate(result.estimates))
      return
    }
    if (i === 0) firstEstimate = result.estimates
  }

  if (!firstEstimate) throw new Error('No estimates computed, expected at least 1')

  // If here is reached, no tokens could afford the fee
  // Set the first one anyway to show something
  yield* put(setFeeEstimate(firstEstimate))
}

export const {
  name: estimateFeeSagaName,
  wrappedSaga: estimateFeeSaga,
  reducer: estimateFeeReducer,
  actions: estimateFeeActions,
} = createMonitoredSaga<EstimateFeeParams>(estimateFee, 'estimateFee')

function* calculateFee(
  token: NativeTokenId,
  txs: Array<{ type: TransactionType; tx?: CeloTransactionRequest }>,
  force?: boolean
) {
  const gasPrice = yield* call(fetchGasPriceIfStale, token)

  let totalFee = BigNumber.from(0)
  const estimates: FeeEstimate[] = []
  for (const tx of txs) {
    const gasLimit = yield* call(estimateGas, tx.type, tx.tx, token, force)
    // TODO add gateway fee here
    const fee = BigNumber.from(gasPrice).mul(gasLimit)
    totalFee = totalFee.add(fee)
    estimates.push({
      token,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      fee: fee.toString(),
    })
  }

  return {
    totalFee,
    estimates,
  }
}
