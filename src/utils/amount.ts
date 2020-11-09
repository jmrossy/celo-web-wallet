import { BigNumber, utils } from 'ethers'
import { useMemo } from 'react'
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

export function useWeiTransaction(amount: number, fee: number) {
  const total = useMemo(() => { return amount + fee; }, [amount, fee]);

  const weiFee = useMemo(() => { return utils.parseEther('' + 0.02); }, [fee]);
  const weiAmount = useMemo(() => { return utils.parseEther('' + amount || "0"); }, [amount]);

  const weiTotal = useMemo(() => {
    const feeNum = parseFloat(utils.formatEther(weiFee));
    const amountNum = parseFloat(utils.formatEther(weiAmount));
    return utils.parseEther('' + (amountNum + feeNum));
  }, [weiFee, weiAmount]);

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
    }
  }
}

const exchangeWeiBasis = utils.parseEther('' + 1);

export function useWeiExchange(fromAmount: number, fromCurrency: Currency, exchangeRate: number, feeInFromCurrency: number) {
  const toCurrency = useMemo(() => { return fromCurrency === Currency.CELO ? Currency.cUSD : Currency.CELO; }, [fromCurrency]);
  const weiRate = useMemo(() => { return utils.parseEther('' + exchangeRate); }, [exchangeRate]);
  const fromWeiAmount = useMemo(() => { return utils.parseEther('' + fromAmount); }, [fromAmount, fromCurrency]);
  const toAmount = useMemo(() => { return ((fromAmount * exchangeRate) - feeInFromCurrency); }, [fromAmount, fromCurrency, exchangeRate, feeInFromCurrency]);
  const toWeiAmount = useMemo(() => { return utils.parseEther('' + toAmount); }, [toAmount]);
  // const exchangeLabel = useMemo(() => { return `1 ${fromCurrency} to ${exchangeRate} ${toCurrency}`; }, [fromCurrency, toCurrency, exchangeRate]);

  return {
    from: {
      amount: fromAmount,
      weiAmount: fromWeiAmount,
      currency: fromCurrency,
    },
    to: {
      amount: toAmount,
      weiAmount: toWeiAmount,
      currency: toCurrency,
    },
    props: {
      rate: exchangeRate,
      fee: feeInFromCurrency,
      feeCurrency: fromCurrency,
      weiBasis: exchangeWeiBasis,
      weiRate: weiRate
    }

  }
}