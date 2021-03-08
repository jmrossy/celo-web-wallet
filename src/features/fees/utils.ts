import { BigNumber } from 'ethers'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { MAX_FEE_SIZE, MAX_GAS_LIMIT, MAX_GAS_PRICE } from 'src/consts'
import { Currency, NativeTokenId, NativeTokens } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'
import { CeloTransaction } from 'src/features/types'
import { logger } from 'src/utils/logger'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function validateFeeEstimate(estimate: FeeEstimate | undefined | null): ErrorState | null {
  if (!estimate) {
    return invalidInput('fee', 'No fee set')
  }

  const { gasPrice, gasLimit, fee, currency } = estimate

  if (!currency || (currency !== Currency.CELO && currency !== Currency.cUSD)) {
    logger.error(`Invalid fee currency: ${currency}`)
    return invalidInput('fee', 'Invalid fee currency')
  }

  if (!gasPrice || BigNumber.from(gasPrice).gt(MAX_GAS_PRICE)) {
    logger.error(`Invalid gas price: ${gasPrice}`)
    return invalidInput('fee', 'Invalid gas price')
  }

  if (!gasLimit || BigNumber.from(gasLimit).gt(MAX_GAS_LIMIT)) {
    logger.error(`Invalid gas limit: ${gasLimit}`)
    return invalidInput('fee', 'Invalid gas limit')
  }

  if (!fee) {
    logger.error(`No fee amount set`)
    return invalidInput('fee', 'No fee amount set')
  }

  if (BigNumber.from(fee).gt(MAX_FEE_SIZE)) {
    logger.error(`Fee is too large: ${fee}`)
    return invalidInput('fee', 'Fee is too large')
  }

  return null
}

export function validateFeeEstimates(estimates: Array<FeeEstimate | undefined | null> | undefined) {
  if (!estimates || !estimates.length) {
    return invalidInput('fee', 'No fee set')
  }

  for (const estimate of estimates) {
    const result = validateFeeEstimate(estimate)
    if (result) return result
  }

  return null
}

// Looks at the tx properties to infer what its fee was
export function getFeeFromConfirmedTx(tx: CeloTransaction) {
  const feeValue = BigNumber.from(tx.gasPrice)
    .mul(tx.gasUsed)
    .add(tx.gatewayFee ?? 0)
  const feeCurrency = NativeTokens[tx.feeCurrency ?? NativeTokenId.CELO]
  return { feeValue, feeCurrency }
}

// Gets fee from state and returns amount, fee, and total, all in wei
export function useFee(amountInWei: string | null | undefined, txCount = 1) {
  const feeEstimates = useSelector((state: RootState) => state.fees.estimates)

  if (!feeEstimates || !feeEstimates.length || !amountInWei) {
    return {
      amount: amountInWei ?? '',
      total: amountInWei ?? '',
      feeAmount: null,
      feeCurrency: null,
      feeEstimates,
    }
  }

  let total = BigNumber.from(amountInWei)
  let feeAmount = BigNumber.from(0)
  const feeCurrency = feeEstimates[0].currency // all estimates use the same currency
  for (let i = 0; i < txCount; i++) {
    const estimate = feeEstimates[i]
    if (!estimate) {
      logger.error(`Attempting to use fee number ${i} but it's missing in state`)
      continue
    }
    // TODO handle case where fee currency !== amount currency
    total = total.add(estimate.fee)
    feeAmount = feeAmount.add(estimate.fee)
  }

  return {
    amount: amountInWei,
    total: total.toString(),
    feeAmount: feeAmount.toString(),
    feeCurrency,
    feeEstimates,
  }
}

export function getTotalFee(feeEstimates: FeeEstimate[]) {
  const totalFee = feeEstimates.reduce(
    (total: BigNumber, curr: FeeEstimate) => total.add(curr.fee),
    BigNumber.from(0)
  )
  const feeCurrency = feeEstimates[0].currency // assumes same fee currency for all estimates
  return {
    totalFee,
    feeCurrency,
  }
}
