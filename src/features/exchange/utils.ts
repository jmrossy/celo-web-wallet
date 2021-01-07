import { BigNumber } from 'ethers'
import { WEI_PER_UNIT } from 'src/consts'
import { Currency, getOtherCurrency } from 'src/currency'
import { ExchangeRate } from 'src/features/exchange/types'
import { TokenExchangeTx } from 'src/features/types'
import { fromWei, toWei } from 'src/utils/amount'
import { logger } from 'src/utils/logger'

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
