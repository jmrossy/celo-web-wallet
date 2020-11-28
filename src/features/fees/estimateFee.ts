import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { Currency } from 'src/consts'
import { estimateGas } from 'src/features/fees/estimateGas'
import { setFeeEstimate } from 'src/features/fees/feeSlice'
import { fetchGasPriceIfStale } from 'src/features/fees/gasPrice'
import { FeeEstimate } from 'src/features/fees/types'
import { TransactionType } from 'src/features/types'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

interface EstimateFeeParams {
  txs: Array<{ type: TransactionType; tx?: CeloTransactionRequest }>
  forceGasEstimation?: boolean
  preferredCurrency?: Currency
}

// Enough CELO  | Enough cUSD	| Preference |  Fee
// yes	          yes	          celo	        celo
// yes	          yes	          cusd	        cusd
// yes	          no	          celo	        celo
// yes	          no	          cusd	        celo
// no	            yes	          celo	        cusd
// no	            yes	          cusd	        cusd
// no	            no	          celo	        celo
// no	            no	          cusd	        cusd
// yes	          yes	          -	            celo
// yes	          no	          -	            celo
// no	            yes	          -	            cusd
// no	            no	          -	            celo|cusd

function* estimateFee(params: EstimateFeeParams) {
  // Clear fee while new few is computed
  yield* put(setFeeEstimate(null))

  const { celo: celoBalanceStr, cUsd: cUsdBalanceStr } = yield* call(fetchBalancesIfStale)
  const celoBalance = BigNumber.from(celoBalanceStr)
  const cUsdBalance = BigNumber.from(cUsdBalanceStr)

  const { txs, forceGasEstimation: force, preferredCurrency } = params

  if (celoBalance.lte(0) && cUsdBalance.lte(0)) {
    // Just use CELO for empty accounts
    const { estimates } = yield* call(calculateFee, Currency.CELO, txs, force)
    yield* put(setFeeEstimate(estimates))
    return
  }

  if (preferredCurrency === Currency.CELO) {
    // Try CELO, then try cUSD, fallback to CELO
    yield* call(
      estimateFeeWithPreference,
      Currency.CELO,
      Currency.cUSD,
      celoBalance,
      cUsdBalance,
      txs,
      force
    )
    return
  }

  if (preferredCurrency === Currency.cUSD) {
    // Try cUSD, then try CELO, fallback to cUSD
    yield* call(
      estimateFeeWithPreference,
      Currency.cUSD,
      Currency.CELO,
      cUsdBalance,
      celoBalance,
      txs,
      force
    )
    return
  }

  if (celoBalance.gt(0)) {
    // Try CELO, fallback to cUSD
    const { estimates, totalFee } = yield* call(calculateFee, Currency.CELO, txs, force)
    if (celoBalance.gte(totalFee)) {
      yield* put(setFeeEstimate(estimates))
      return
    }
  }

  // Otherwise use cUSD
  const { estimates } = yield* call(calculateFee, Currency.cUSD, txs, force)
  yield* put(setFeeEstimate(estimates))
}

export const {
  name: estimateFeeSagaName,
  wrappedSaga: estimateFeeSaga,
  reducer: estimateFeeReducer,
  actions: estimateFeeActions,
} = createMonitoredSaga<EstimateFeeParams>(estimateFee, 'estimateFee')

function* estimateFeeWithPreference(
  primaryCurrency: Currency,
  alternativeCurrency: Currency,
  primaryBalance: BigNumber,
  alternativeBalance: BigNumber,
  txs: Array<{ type: TransactionType; tx?: CeloTransactionRequest }>,
  force?: boolean
) {
  // Try primary, then alternate, then fallback primary

  const primaryResult = yield* call(calculateFee, primaryCurrency, txs, force)
  if (primaryResult.totalFee.lte(primaryBalance) || alternativeBalance.lte(0)) {
    yield* put(setFeeEstimate(primaryResult.estimates))
    return
  }

  const altResult = yield* call(calculateFee, alternativeCurrency, txs, force)
  if (altResult.totalFee.lte(alternativeBalance)) {
    yield* put(setFeeEstimate(altResult.estimates))
    return
  }

  yield* put(setFeeEstimate(primaryResult.estimates))
}

function* calculateFee(
  currency: Currency,
  txs: Array<{ type: TransactionType; tx?: CeloTransactionRequest }>,
  force?: boolean
) {
  const gasPrice = yield* call(fetchGasPriceIfStale, currency)

  let totalFee = BigNumber.from(0)
  const estimates: FeeEstimate[] = []
  for (const tx of txs) {
    const gasLimit = yield* call(estimateGas, tx.type, tx.tx, currency, force)
    // TODO add gateway fee here
    const fee = BigNumber.from(gasPrice).mul(gasLimit)
    totalFee = totalFee.add(fee)
    estimates.push({
      currency,
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
