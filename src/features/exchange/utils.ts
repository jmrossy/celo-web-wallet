import { BigNumber } from 'ethers'
import { WEI_PER_UNIT } from 'src/consts'
import { ExchangeRate } from 'src/features/exchange/types'
import { TokenExchangeTx } from 'src/features/types'
import { Balances } from 'src/features/wallet/types'
import { CELO, cUSD, Token } from 'src/tokens'
import { fromWei, toWei } from 'src/utils/amount'
import { logger } from 'src/utils/logger'

export function useExchangeValues(
  fromAmount: number | string | null | undefined,
  fromTokenId: string | null | undefined,
  toTokenId: string | null | undefined,
  balances: Balances,
  toCeloRate: ExchangeRate | null | undefined,
  isFromAmountWei: boolean
) {
  if (!fromTokenId || !toTokenId || !toCeloRate) {
    // Return some defaults when values are missing
    return getDefaultExchangeValues(cUSD, CELO)
  }

  const fromToken = balances.tokens[fromTokenId]
  const toToken = balances.tokens[toTokenId]

  try {
    const exchangeRate = fromTokenId === CELO.id ? 1 / toCeloRate.rate : toCeloRate.rate
    const exchangeRateWei = toWei(exchangeRate)

    const fromAmountWei = isFromAmountWei ? BigNumber.from(fromAmount) : toWei(fromAmount)
    const fromAmountNum = isFromAmountWei ? fromWei(fromAmount) : parseFloat('' + fromAmount)
    const toAmountWei = toWei(fromAmountNum * exchangeRate)

    return {
      from: {
        weiAmount: fromAmountWei.toString(),
        token: fromToken,
      },
      to: {
        weiAmount: toAmountWei.toString(),
        token: toToken,
      },
      rate: {
        weiBasis: WEI_PER_UNIT,
        weiRate: exchangeRateWei.toString(),
        rate: exchangeRate,
        lastUpdated: toCeloRate.lastUpdated,
      },
    }
  } catch (error) {
    logger.warn('Error computing exchange values')
    return getDefaultExchangeValues(fromToken, toToken)
  }
}

function getDefaultExchangeValues(
  _fromToken: Token | null | undefined,
  _toToken: Token | null | undefined
) {
  const fromToken = _fromToken || cUSD
  const toToken = _toToken || CELO

  return {
    from: {
      weiAmount: '0',
      token: fromToken,
    },
    to: {
      weiAmount: '0',
      token: toToken,
    },
    rate: {
      rate: 0,
      lastUpdated: 0,
      weiBasis: WEI_PER_UNIT,
      weiRate: '0',
    },
  }
}

// This assumes to or from token is CELO
export function computeToCeloRate(tx: TokenExchangeTx) {
  if (!tx) {
    return {
      weiRate: '0',
      weiBasis: WEI_PER_UNIT,
      otherToken: cUSD,
    }
  }
  const fromValue = fromWei(tx.fromValue)
  const toValue = fromWei(tx.toValue)

  if (!fromValue || !toValue) {
    return {
      weiRate: '0',
      weiBasis: WEI_PER_UNIT,
      otherToken: cUSD,
    }
  }

  const rate = tx.fromToken.id === CELO.id ? toValue / fromValue : fromValue / toValue
  const otherToken = tx.fromToken.id === CELO.id ? tx.toToken : tx.fromToken
  return {
    weiRate: toWei(rate).toString(),
    weiBasis: WEI_PER_UNIT,
    otherToken,
  }
}
