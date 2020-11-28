import { BigNumber, BigNumberish, FixedNumber, utils } from 'ethers'
import { Currency, WEI_PER_UNIT } from 'src/consts'
import { Balances } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'

export function isAmountValid(
  amountInWei: BigNumberish,
  currency: Currency,
  balances: Balances,
  max: string
) {
  const _amountInWei = BigNumber.from(amountInWei)
  if (_amountInWei.lte(0)) {
    logger.warn(`Invalid amount, too small: ${_amountInWei.toString()}`)
    return false
  }

  if (_amountInWei.gte(max)) {
    logger.warn(`Invalid amount, too big: ${_amountInWei.toString()}`)
    return false
  }

  if (!balances.lastUpdated) {
    throw new Error('Checking amount validity without fresh balances')
  }

  if (currency === Currency.cUSD && _amountInWei.gt(balances.cUsd)) {
    logger.warn(`Exceeds cUSD balance: ${_amountInWei.toString()}`)
    return false
  }

  if (currency === Currency.CELO && _amountInWei.gt(balances.celo)) {
    logger.warn(`Exceeds CELO balance: ${_amountInWei.toString()}`)
    return false
  }

  return true
}

export function fromWei(value: BigNumberish | null | undefined): number {
  if (!value) return 0
  return parseFloat(utils.formatEther(value))
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
  cUsdToCelo: number | null | undefined,
  isFromAmountWei: boolean
) {
  if (!fromCurrency || !cUsdToCelo) {
    // Return some defaults when values are missing
    return getDefaultExchangeValues()
  }

  try {
    const toCurrency = fromCurrency === Currency.CELO ? Currency.cUSD : Currency.CELO
    const exchangeRate = fromCurrency === Currency.cUSD ? cUsdToCelo : 1 / cUsdToCelo
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
      },
    }
  } catch (error) {
    logger.warn('Error computing exchange values')
    return getDefaultExchangeValues(fromCurrency)
  }
}

function getDefaultExchangeValues(fromCurrency?: Currency | null) {
  const _fromCurrency = fromCurrency || Currency.cUSD
  const _toCurrency = fromCurrency === Currency.CELO ? Currency.cUSD : Currency.CELO

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
      weiBasis: WEI_PER_UNIT,
      weiRate: '0',
    },
  }
}
