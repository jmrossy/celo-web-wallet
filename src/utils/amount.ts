import { BigNumber, BigNumberish, utils } from 'ethers'
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

export function useExchangeValues(
  fromAmount: number | string | null | undefined,
  fromCurrency: Currency | null | undefined,
  cUsdToCelo: number | null | undefined,
  isFromAmountWei: boolean
) {
  if (!fromCurrency || !cUsdToCelo) {
    // Return some defaults when values are missing
    return {
      from: {
        weiAmount: '0',
        currency: Currency.CELO,
      },
      to: {
        weiAmount: '0',
        currency: Currency.cUSD,
      },
      rate: {
        weiBasis: WEI_PER_UNIT,
        weiRate: '0',
      },
    }
  }

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
}
