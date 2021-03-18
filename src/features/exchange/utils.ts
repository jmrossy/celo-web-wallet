import { BigNumber, BigNumberish, FixedNumber } from 'ethers'
import { WEI_PER_UNIT } from 'src/consts'
import { ToCeloRates } from 'src/features/exchange/types'
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
  toCeloRates: ToCeloRates,
  isFromAmountWei: boolean
) {
  if (!fromTokenId || !toTokenId || !toCeloRates) {
    // Return some defaults when values are missing
    return getDefaultExchangeValues(cUSD, CELO)
  }

  const sellCelo = fromTokenId === CELO.id
  const fromToken = balances.tokens[fromTokenId]
  const toToken = balances.tokens[toTokenId]
  const stableTokenId = sellCelo ? toTokenId : fromTokenId
  const toCeloRate = toCeloRates[stableTokenId]
  if (!toCeloRate) {
    // Return some defaults when rate is loading
    return getDefaultExchangeValues(fromToken, toToken)
  }

  const { stableBucket, celoBucket, spread } = toCeloRate
  const [buyBucket, sellBucket] = sellCelo ? [stableBucket, celoBucket] : [celoBucket, stableBucket]

  try {
    // _getBuyTokenAmount from exchange.sol

    // _getSellTokenAmount from exchange.sol
    // buyAmount.multipliedBy(sellBucket)
    // .div(buyBucket.minus(buyAmount).multipliedBy(new BigNumber(1).minus(spread)))

    // const exchangeRate = fromTokenId === CELO.id ? 1 / toCeloRate.rate : toCeloRate.rate
    // const exchangeRateWei = toWei(exchangeRate)

    const fromAmountWei = isFromAmountWei ? BigNumber.from(fromAmount) : toWei(fromAmount)

    const { exchangeRateNum, exchangeRateWei, toAmountWei } = getSimpleExchangeRate(
      fromAmountWei,
      buyBucket,
      sellBucket,
      spread,
      sellCelo
    )

    // const fromAmountNum = isFromAmountWei ? fromWei(fromAmount) : parseFloat('' + fromAmount)
    // const fromAmountFN = FixedNumber.from(fromAmountNum)

    // const reducedSellAmt = fromAmountFN.mulUnsafe(
    //   FixedNumber.from(1).subUnsafe(FixedNumber.from(spread))
    // )
    // const toAmountFN = reducedSellAmt
    //   .mulUnsafe(FixedNumber.from(buyBucket))
    //   .divUnsafe(reducedSellAmt.addUnsafe(FixedNumber.from(sellBucket)))
    // const toAmountWei = toWei(toAmountFN.toString())

    // const effectiveRateFN = fromAmountFN.divUnsafe(toAmountFN)
    // const exchangeRateNum =
    //   fromTokenId === CELO.id
    //     ? effectiveRateFN.toUnsafeFloat()
    //     : FixedNumber.from(1).divUnsafe(effectiveRateFN).toUnsafeFloat()
    // const exchangeRateWei = toWei(exchangeRateNum)

    // // const reducedSellAmt = fromAmountNum.multipliedBy(new BigNumber(1).minus(spread))
    // reducedSellAmt.multipliedBy(buyBucket)
    //   .div(sellBucket.plus(reducedSellAmt))

    // const toAmountWei = toWei(fromAmountNum * exchangeRate)

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
        value: exchangeRateNum,
        weiValue: exchangeRateWei.toString(),
        weiBasis: WEI_PER_UNIT,
        lastUpdated: toCeloRate.lastUpdated,
        isReady: true,
      },
    }
  } catch (error) {
    logger.warn('Error computing exchange values')
    return getDefaultExchangeValues(fromToken, toToken, true)
  }
}

export function getSimpleExchangeRate(
  amountInWei: BigNumberish,
  buyBucket: string,
  sellBucket: string,
  spread: string,
  sellCelo: boolean
) {
  const fromAmountFN = FixedNumber.from(fromWei(amountInWei))

  const reducedSellAmt = fromAmountFN.mulUnsafe(
    FixedNumber.from(1).subUnsafe(FixedNumber.from(spread))
  )
  const toAmountFN = reducedSellAmt
    .mulUnsafe(FixedNumber.from(buyBucket))
    .divUnsafe(reducedSellAmt.addUnsafe(FixedNumber.from(sellBucket)))
  const toAmountWei = toWei(toAmountFN.toString())

  const effectiveRateFN = fromAmountFN.divUnsafe(toAmountFN)
  const exchangeRateNum = sellCelo
    ? effectiveRateFN.toUnsafeFloat()
    : FixedNumber.from(1).divUnsafe(effectiveRateFN).toUnsafeFloat()
  const exchangeRateWei = toWei(exchangeRateNum)

  return { exchangeRateNum, exchangeRateWei, toAmountWei }
}

function getDefaultExchangeValues(
  _fromToken: Token | null | undefined,
  _toToken: Token | null | undefined,
  isRateReady = false
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
      value: 0,
      weiValue: '0',
      weiBasis: WEI_PER_UNIT,
      lastUpdated: 0,
      isReady: isRateReady,
    },
  }
}

// This assumes either the to or the from token is CELO
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
