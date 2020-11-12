import { BigNumber, utils } from 'ethers'
import { Currency } from 'src/consts'
import { Balances } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'

export function isAmountValid(
  amountInWei: BigNumber,
  currency: Currency,
  balances: Balances,
  max: string
) {
  if (amountInWei.lte(0)) {
    logger.warn(`Invalid amount, too small: ${amountInWei.toString()}`)
    return false
  }

  if (amountInWei.gte(max)) {
    logger.warn(`Invalid amount, too big: ${amountInWei.toString()}`)
    return false
  }

  if (!balances.lastUpdated) {
    throw new Error('Checking amount validity without fresh balances')
  }

  if (currency === Currency.cUSD && amountInWei.gt(balances.cUsd)) {
    logger.warn(`Exceeds cUSD balance: ${amountInWei.toString()}`)
    return false
  }

  if (currency === Currency.CELO && amountInWei.gt(balances.celo)) {
    logger.warn(`Exceeds CELO balance: ${amountInWei.toString()}`)
    return false
  }

  return true
}

export function useWeiAmounts(amount: number, fee: number) {
  const total = amount + fee
  const weiFee = utils.parseEther('' + fee)
  const weiAmount = utils.parseEther('' + amount || '0')
  const weiTotal = utils.parseEther('' + total)

  return {
    wei: {
      amount: weiAmount,
      fee: weiFee,
      total: weiTotal,
    },
    std: {
      amount: amount,
      fee: fee,
      total: total,
    },
  }
}

const exchangeWeiBasis = utils.parseEther('' + 1)

export function useWeiExchange(
  fromAmount: number,
  fromCurrency: Currency,
  exchangeRate: number,
  feeInFromCurrency: number
) {
  const toCurrency = fromCurrency === Currency.CELO ? Currency.cUSD : Currency.CELO
  const weiRate = utils.parseEther('' + exchangeRate)
  const fromWeiAmount = utils.parseEther('' + fromAmount)
  const weiFee = utils.parseEther('' + feeInFromCurrency)
  const toAmount = fromAmount * exchangeRate - feeInFromCurrency
  // const toWeiAmount = fromWeiAmount.mul(exchangeRate).sub(weiFee);
  const toWeiAmount = utils.parseEther('' + toAmount)

  return {
    from: {
      weiAmount: fromWeiAmount,
      currency: fromCurrency,
    },
    to: {
      weiAmount: toWeiAmount,
      currency: toCurrency,
    },
    props: {
      feeCurrency: fromCurrency,
      weiBasis: exchangeWeiBasis,
      weiRate: weiRate,
      weiFee: weiFee,
    },
  }
}
