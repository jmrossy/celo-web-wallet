import { BigNumber, Contract } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { sendTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import {
  Currency,
  EXCHANGE_RATE_STALE_TIME,
  MAX_EXCHANGE_TOKEN_SIZE,
  MIN_EXCHANGE_RATE,
} from 'src/consts'
import { ExchangeRate, ExchangeTokenParams } from 'src/features/exchange/types'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { fromWei, isAmountValid, toWei } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { ErrorState, invalidInput } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(
  params: ExchangeTokenParams,
  balances: Balances,
  validateRate = false,
  validateFee = false
): ErrorState {
  const { amountInWei, fromCurrency, feeEstimates, exchangeRate } = params
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    //make sure there is an amount
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else if (!isAmountValid(amountInWei, fromCurrency, balances, MAX_EXCHANGE_TOKEN_SIZE)) {
    errors = {
      ...errors,
      ...invalidInput('amount', 'Amount not available'),
    }
  }

  if (validateRate) {
    errors = {
      ...validateExchangeRate(exchangeRate),
      ...errors,
    }
  }

  if (validateFee) {
    errors = {
      ...validateFeeEstimate(feeEstimates && feeEstimates[0]),
      ...validateFeeEstimate(feeEstimates && feeEstimates[1]),
      ...errors,
    }
  }

  return errors
}

export function validateExchangeRate(exchangeRate?: ExchangeRate): ErrorState {
  if (!exchangeRate) {
    return { isValid: false, fee: { error: true, helpText: 'No exchange rate set' } }
  }

  const { rate, lastUpdated } = exchangeRate

  if (!rate || rate < MIN_EXCHANGE_RATE) {
    logger.error(`Exchange rate too low: ${rate}`)
    return { isValid: false, fee: { error: true, helpText: 'Exchange rate too low' } }
  }

  if (isStale(lastUpdated, EXCHANGE_RATE_STALE_TIME * 2)) {
    logger.error(`Exchange rate too stale`)
    return { isValid: false, fee: { error: true, helpText: 'Exchange rate too stale' } }
  }

  return { isValid: true }
}

function* exchangeToken(params: ExchangeTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  const validateResult = yield* call(validate, params, balances, true, true)
  if (!validateResult.isValid) {
    throw new Error('Invalid transaction') //TODO: provide details of the error
  }

  yield* call(_exchangeToken, params)
  yield* put(fetchBalancesActions.trigger())
}

async function _exchangeToken(params: ExchangeTokenParams) {
  const { amountInWei, fromCurrency, feeEstimates, exchangeRate } = params
  logger.info(`Exchanging ${amountInWei} ${fromCurrency}`)

  if (!feeEstimates || feeEstimates.length !== 2) {
    throw new Error('Fee estimates not provided correctly')
  }
  if (!exchangeRate) {
    throw new Error('Exchange rate not provided correctly')
  }

  const amountInWeiBn = BigNumber.from(amountInWei)
  await approveExchange(amountInWeiBn, fromCurrency, feeEstimates[0])
  await executeExchange(amountInWeiBn, fromCurrency, exchangeRate, feeEstimates[1])
}

async function approveExchange(
  amountInWei: BigNumber,
  fromCurrency: Currency,
  feeEstimate: FeeEstimate
) {
  const exchange = await getContract(CeloContract.Exchange)

  let tokenContract: Contract
  if (fromCurrency === Currency.cUSD) {
    tokenContract = await getContract(CeloContract.StableToken)
  } else if (fromCurrency === Currency.CELO) {
    tokenContract = await getContract(CeloContract.GoldToken)
  } else {
    throw new Error(`Unsupported currency: ${fromCurrency}`)
  }

  const txRequest = await tokenContract.populateTransaction.approve(exchange.address, amountInWei)
  const txReceipt = await sendTransaction(txRequest, feeEstimate)
  logger.info(`Exchange approval hash received: ${txReceipt.transactionHash}`)
}

async function executeExchange(
  amountInWei: BigNumber,
  fromCurrency: Currency,
  exchangeRate: ExchangeRate,
  feeEstimate: FeeEstimate
) {
  const minBuyAmount = getMinBuyAmount(amountInWei, exchangeRate)
  const exchange = await getContract(CeloContract.Exchange)
  // TODO swap method for .sell once updated contract is live
  const txRequest = await exchange.populateTransaction.exchange(
    amountInWei,
    minBuyAmount,
    fromCurrency === Currency.CELO
  )
  const txReceipt = await sendTransaction(txRequest, feeEstimate)
  logger.info(`Exchange hash received: ${txReceipt.transactionHash}`)
}

export const {
  name: exchangeTokenSagaName,
  wrappedSaga: exchangeTokenSaga,
  reducer: exchangeTokenReducer,
  actions: exchangeTokenActions,
} = createMonitoredSaga<ExchangeTokenParams>(exchangeToken, 'exchangeToken')

function getMinBuyAmount(amountInWei: BigNumber, exchangeRate: ExchangeRate) {
  // Allow a small (2%) wiggle room to increase success rate even if
  // rate changes slightly before tx goes out
  return toWei(fromWei(amountInWei) * exchangeRate.rate * 0.98)
}
