import { BigNumber, BigNumberish, FixedNumber, utils } from 'ethers'
import { Currency, getCurrencyProps } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'
import { getTotalFee } from 'src/features/fees/utils'
import { Balances } from 'src/features/wallet/types'
import { getCurrencyBalance } from 'src/features/wallet/utils'
import { logger } from 'src/utils/logger'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function range(length: number, start = 0, step = 1) {
  const range = []
  for (let i = start; i < length; i += step) {
    range.push(i)
  }
  return range
}

export function validateAmount(
  _amountInWei: BigNumberish,
  currency: Currency,
  balances: Balances,
  max?: BigNumberish
): ErrorState | null {
  const amountInWei = BigNumber.from(_amountInWei)

  if (amountInWei.lte(0)) {
    logger.warn(`Invalid amount, too small: ${amountInWei.toString()}`)
    return invalidInput('amount', 'Amount too small')
  }

  if (max && amountInWei.gte(max) && !areAmountsNearlyEqual(amountInWei, max, currency)) {
    logger.warn(`Invalid amount, too big: ${amountInWei.toString()}`)
    return invalidInput('amount', 'Amount too big')
  }

  if (!balances.lastUpdated) {
    throw new Error('Checking amount validity without fresh balances')
  }

  const balance = getCurrencyBalance(balances, currency)
  if (amountInWei.gt(balance)) {
    if (areAmountsNearlyEqual(amountInWei, balance, currency)) {
      logger.debug('Validation allowing amount that nearly equals balance')
    } else {
      logger.warn(`Exceeds ${currency} balance: ${amountInWei.toString()}`)
      return invalidInput('amount', 'Amount too big')
    }
  }

  return null
}

export function validateAmountWithFees(
  txAmountInWei: BigNumberish,
  txCurrency: Currency,
  balances: Balances,
  feeEstimates: FeeEstimate[] | undefined
): ErrorState | null {
  if (!feeEstimates || !feeEstimates.length) {
    logger.error('No fee set')
    return invalidInput('fee', 'No fee set')
  }

  const { totalFee, feeCurrency } = getTotalFee(feeEstimates)

  if (feeCurrency === txCurrency) {
    const balance = getCurrencyBalance(balances, txCurrency)
    const amountWithFee = totalFee.add(txAmountInWei)
    if (amountWithFee.gt(balance)) {
      if (areAmountsNearlyEqual(amountWithFee, balance, txCurrency)) {
        logger.debug('Validation allowing amount that nearly equals balance')
      } else {
        logger.error(`Fee plus amount exceeds ${txCurrency} balance`)
        return invalidInput('fee', 'Fee plus amount exceeds balance')
      }
    }
  } else {
    const balance = getCurrencyBalance(balances, feeCurrency)
    if (totalFee.gt(balance)) {
      logger.error(`Total fee exceeds ${txCurrency} balance`)
      return invalidInput('fee', 'Fee exceeds balance')
    }
  }

  return null
}

// Get amount that is adjusted when user input is nearly the same as their balance
export function getAdjustedAmount(
  _amountInWei: string,
  txCurrency: Currency,
  balances: Balances,
  feeEstimates: FeeEstimate[]
): BigNumber {
  const amountInWei = BigNumber.from(_amountInWei)
  const balance = BigNumber.from(getCurrencyBalance(balances, txCurrency))

  if (areAmountsNearlyEqual(amountInWei, balance, txCurrency)) {
    const { totalFee, feeCurrency } = getTotalFee(feeEstimates)
    if (txCurrency === feeCurrency) {
      // TODO this still leaves a small bit in the account because
      // the static gas limit is higher than needed. Fix will require
      // computing exact gas, but that still doesn't work well for feeCurrency=cUSD
      return balance.sub(totalFee)
    } else {
      return balance
    }
  } else {
    // Just the amount entered, no adjustment needed
    return amountInWei
  }
}

// Checks if an amount is equal of nearly equal to balance within a small margin of error
// Necessary because amounts in the UI are often rounded
export function areAmountsNearlyEqual(
  amountInWei1: BigNumber,
  amountInWei2: BigNumberish,
  currency: Currency
) {
  const { minValue } = getCurrencyProps(currency)
  const minValueWei = toWei(minValue)
  // Is difference btwn amount and balance less than min amount shown for currency
  return amountInWei1.sub(amountInWei2).abs().lt(minValueWei)
}

export function fromWei(value: BigNumberish | null | undefined): number {
  if (!value) return 0
  return parseFloat(utils.formatEther(value))
}

// Similar to fromWei above but rounds to set number of decimals
// with a minimum floor, configured per currency
export function fromWeiRounded(
  value: BigNumberish | null | undefined,
  currency: Currency,
  roundDownIfSmall = false
): string {
  if (!value) return '0'

  const { decimals, minValue: _minValue } = getCurrencyProps(currency)
  const minValue = FixedNumber.from(`${_minValue}`) // FixedNumber throws error when given number for some reason
  const bareMinValue = FixedNumber.from(`${_minValue / 5}`)

  const amount = FixedNumber.from(utils.formatEther(value))
  if (amount.isZero()) return '0'

  // If amount is less than min value
  if (amount.subUnsafe(minValue).isNegative()) {
    // If we should round and amount is really small
    if (roundDownIfSmall && amount.subUnsafe(bareMinValue).isNegative()) {
      return '0'
    }
    return minValue.toString()
  }

  return amount.round(decimals).toString()
}

export function toWei(value: BigNumberish | null | undefined): BigNumber {
  if (!value) return BigNumber.from(0)
  return utils.parseEther('' + value)
}

// Take an object with an amount field and convert it to amountInWei
// Useful in converting for form <-> saga communication
export function amountFieldToWei<T extends { amount: string }>(fields: T) {
  try {
    return {
      ...fields,
      amountInWei: toWei(fields.amount).toString(),
    }
  } catch (error) {
    logger.warn('Error converting amount to wei', error)
    return {
      ...fields,
      amountInWei: '0',
    }
  }
}

// Take an object with an amountInWei field and convert it amount (in 'ether')
// Useful in converting for saga <-> form communication
export function amountFieldFromWei<T extends { amountInWei: string }>(fields: T) {
  try {
    return {
      ...fields,
      amount: fromWei(fields.amountInWei).toString(),
    }
  } catch (error) {
    logger.warn('Error converting amount from wei', error)
    return {
      ...fields,
      amount: '0',
    }
  }
}

export function fromFixidity(value: BigNumberish | null | undefined): number {
  if (!value) return 0
  return FixedNumber.from(value)
    .divUnsafe(FixedNumber.from('1000000000000000000000000'))
    .toUnsafeFloat()
}

// Strangely the Ethers BN doesn't have a min function
export function BigNumberMin(bn1: BigNumber, bn2: BigNumber) {
  return bn1.gte(bn2) ? bn2 : bn1
}
