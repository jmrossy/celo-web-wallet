import { BigNumber, BigNumberish, FixedNumber, utils } from 'ethers'
import { WEI_PER_UNIT } from 'src/consts'
import { Currency, getCurrencyProps } from 'src/currency'
import { ExchangeRate } from 'src/features/exchange/types'
import { FeeEstimate } from 'src/features/fees/types'
import { TokenExchangeTx } from 'src/features/types'
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
  amountInWei: BigNumberish,
  currency: Currency,
  balances: Balances,
  max: string
): ErrorState | null {
  const _amountInWei = BigNumber.from(amountInWei)

  if (_amountInWei.lte(0)) {
    logger.warn(`Invalid amount, too small: ${_amountInWei.toString()}`)
    return invalidInput('amount', 'Amount too small')
  }

  if (_amountInWei.gte(max)) {
    logger.warn(`Invalid amount, too big: ${_amountInWei.toString()}`)
    return invalidInput('amount', 'Amount too big')
  }

  if (!balances.lastUpdated) {
    throw new Error('Checking amount validity without fresh balances')
  }

  const balance = getCurrencyBalance(balances, currency)
  if (_amountInWei.gt(balance)) {
    logger.warn(`Exceeds ${currency} balance: ${_amountInWei.toString()}`)
    return invalidInput('amount', 'Amount too big')
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
    logger.error(`No fee set`)
    return invalidInput('fee', 'No fee set')
  }

  const totalFee = feeEstimates.reduce(
    (total: BigNumber, curr: FeeEstimate) => total.add(curr.fee),
    BigNumber.from(0)
  )
  const feeCurrency = feeEstimates[0].currency // assumes same fee currency for all estimates

  if (feeCurrency === txCurrency) {
    const balance = getCurrencyBalance(balances, txCurrency)
    if (totalFee.add(txAmountInWei).gt(balance)) {
      logger.error(`Fee plus amount exceeds ${txCurrency} balance`)
      return invalidInput('fee', 'Fee plus amount exceeds balance')
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

export function fromWei(value: BigNumberish | null | undefined): number {
  if (!value) return 0
  return parseFloat(utils.formatEther(value))
}

// Similar to fromWei above but rounds to set number of decimals
// with a minimum floor, configured per currency
export function fromWeiRounded(value: BigNumberish | null | undefined, currency: Currency): string {
  if (!value) return '0'

  const { decimals, minValue: _minValue } = getCurrencyProps(currency)
  const minValue = FixedNumber.from(`${_minValue}`) // FixedNumber throws error when given number for some reason

  const amount = FixedNumber.from(utils.formatEther(value))
  if (amount.isZero()) {
    return '0'
  } else if (amount.subUnsafe(minValue).isNegative()) {
    return minValue.toString()
  } else {
    return amount.round(decimals).toString()
  }
}

export function toWei(value: BigNumberish | null | undefined): BigNumber {
  if (!value) return BigNumber.from(0)
  return utils.parseEther('' + value)
}

export function fromFixidity(value: BigNumberish | null | undefined): number {
  if (!value) return 0
  return FixedNumber.from(value)
    .divUnsafe(FixedNumber.from('1000000000000000000000000'))
    .toUnsafeFloat()
}

export function useExchangeValues(
  fromAmount: number | string | null | undefined,
  fromCurrency: Currency | null | undefined,
  cUsdToCelo: ExchangeRate | null | undefined,
  isFromAmountWei: boolean
) {
  if (!fromCurrency || !cUsdToCelo) {
    // Return some defaults when values are missing
    return getDefaultExchangeValues()
  }

  try {
    const toCurrency = getOtherCurrency(fromCurrency)
    const exchangeRate = fromCurrency === Currency.cUSD ? cUsdToCelo.rate : 1 / cUsdToCelo.rate
    const exchangeRateWei = toWei(exchangeRate)

    const fromAmountWei = isFromAmountWei ? BigNumber.from(fromAmount) : toWei(fromAmount)
    const fromAmountNum = isFromAmountWei ? fromWei(fromAmount) : parseFloat('' + fromAmount)
    const toAmountWei = toWei(fromAmountNum * exchangeRate)

    return {
      from: {
        weiAmount: fromAmountWei.toString(),
        currency: fromCurrency,
      },
      to: {
        weiAmount: toAmountWei.toString(),
        currency: toCurrency,
      },
      rate: {
        weiBasis: WEI_PER_UNIT,
        weiRate: exchangeRateWei.toString(),
        rate: exchangeRate,
        lastUpdated: cUsdToCelo.lastUpdated,
      },
    }
  } catch (error) {
    logger.warn('Error computing exchange values')
    return getDefaultExchangeValues(fromCurrency)
  }
}

function getDefaultExchangeValues(fromCurrency?: Currency | null) {
  const _fromCurrency = fromCurrency || Currency.cUSD
  const _toCurrency = getOtherCurrency(_fromCurrency)

  return {
    from: {
      weiAmount: '0',
      currency: _fromCurrency,
    },
    to: {
      weiAmount: '0',
      currency: _toCurrency,
    },
    rate: {
      rate: 0,
      lastUpdated: 0,
      weiBasis: WEI_PER_UNIT,
      weiRate: '0',
    },
  }
}

export function computeRate(tx: TokenExchangeTx) {
  if (!tx) {
    return {
      weiRate: 0,
      weiBasis: WEI_PER_UNIT,
    }
  }
  const fromValue = fromWei(tx.fromValue)
  const toValue = fromWei(tx.toValue)

  if (!fromValue || !toValue) {
    return {
      weiRate: 0,
      weiBasis: WEI_PER_UNIT,
    }
  }

  const rate = tx.fromToken === Currency.cUSD ? fromValue / toValue : toValue / fromValue
  return {
    weiRate: toWei(rate).toString(),
    weiBasis: WEI_PER_UNIT,
  }
}

export function getOtherCurrency(currency: Currency) {
  return currency === Currency.CELO ? Currency.cUSD : Currency.CELO
}
