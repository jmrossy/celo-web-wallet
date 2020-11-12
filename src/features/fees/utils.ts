import { BigNumber } from 'ethers'
import { Currency, MAX_FEE_SIZE, MAX_GAS_LIMIT, MAX_GAS_PRICE } from 'src/consts'
import { FeeEstimate } from 'src/features/fees/types'
import { CeloTransaction } from 'src/features/types'
import { logger } from 'src/utils/logger'
import { ErrorState } from 'src/utils/validation'

export function validateFeeEstimate(estimate?: FeeEstimate): ErrorState {
  if (!estimate) {
    return { isValid: false, fee: { error: true, helpText: 'No fee set' } }
  }

  const { gasPrice, gasLimit, fee, currency } = estimate

  if (!currency || (currency !== Currency.CELO && currency !== Currency.cUSD)) {
    logger.error(`Invalid fee currency: ${currency}`)
    return { isValid: false, fee: { error: true, helpText: 'Invalid fee currency' } }
  }

  if (!gasPrice || BigNumber.from(gasPrice).gt(MAX_GAS_PRICE)) {
    logger.error(`Invalid gas price: ${gasPrice}`)
    return { isValid: false, fee: { error: true, helpText: 'Invalid gas price' } }
  }

  if (!gasLimit || BigNumber.from(gasLimit).gt(MAX_GAS_LIMIT)) {
    logger.error(`Invalid gas limit: ${gasLimit}`)
    return { isValid: false, fee: { error: true, helpText: 'Invalid gas limit' } }
  }

  if (!fee || BigNumber.from(fee).gt(MAX_FEE_SIZE)) {
    logger.error(`Invalid fee: ${fee}`)
    return { isValid: false, fee: { error: true, helpText: 'Invalid fee' } }
  }

  return { isValid: true }
}

// Looks at the tx properties to infer what its fee was
export function getFeeFromConfirmedTx(tx: CeloTransaction) {
  // TODO support cUSD fees, assumes CELO for now
  const feeValue = BigNumber.from(tx.gasPrice)
    .mul(tx.gasUsed)
    .add(tx.gatewayFee ?? 0)
  return { feeValue, feeCurrency: Currency.CELO }
}
