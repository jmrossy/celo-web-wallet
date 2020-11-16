import { BigNumber, Contract } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { sendTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { Currency, MAX_EXCHANGE_TOKEN_SIZE } from 'src/consts'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export interface ExchangeTokenParams {
  amountInWei: string
  fromCurrency: Currency
  feeEstimates?: FeeEstimate[]
}

export function validate(
  params: ExchangeTokenParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { amountInWei, fromCurrency, feeEstimates } = params
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

  if (validateFee) {
    errors = {
      ...validateFeeEstimate(feeEstimates && feeEstimates[0]),
      ...validateFeeEstimate(feeEstimates && feeEstimates[1]),
      ...errors,
    }
  }

  return errors
}

function* exchangeToken(params: ExchangeTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  const validateResult = yield* call(validate, params, balances)
  if (!validateResult.isValid) {
    throw new Error('Invalid transaction') //TODO: provide details of the error
  }

  yield* call(_exchangeToken, params)
  yield* put(fetchBalancesActions.trigger())
}

async function _exchangeToken(params: ExchangeTokenParams) {
  const { amountInWei, fromCurrency, feeEstimates } = params
  logger.info(`Exchanging ${amountInWei} ${fromCurrency}`)

  if (!feeEstimates || feeEstimates.length !== 2) {
    throw new Error('Fee estimates not provided correctly')
  }

  const amountInWeiBn = BigNumber.from(amountInWei)
  await approveExchange(amountInWeiBn, fromCurrency, feeEstimates[0])
  await executeExchange(amountInWeiBn, fromCurrency, feeEstimates[1])
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

  // TODO query for expected exchange rate and set minBuyAmount properly
  const txRequest = await tokenContract.populateTransaction.approve(exchange.address, amountInWei)
  const txReceipt = await sendTransaction(txRequest, feeEstimate)
  logger.info(`Exchange approval hash received: ${txReceipt.transactionHash}`)
}

async function executeExchange(
  amountInWei: BigNumber,
  fromCurrency: Currency,
  feeEstimate: FeeEstimate
) {
  const exchange = await getContract(CeloContract.Exchange)

  // TODO query for expected exchange rate and set minBuyAmount properly
  // TODO exchange method for sell once updated contract is live
  const txRequest = await exchange.populateTransaction.exchange(
    amountInWei,
    BigNumber.from(10),
    fromCurrency === Currency.CELO
  )
  const txReceipt = await sendTransaction(txRequest, feeEstimate)
  logger.info(`Exchange hash received: ${txReceipt.transactionHash}`)
}

export const {
  wrappedSaga: exchangeTokenSaga,
  reducer: exchangeTokenReducer,
  actions: exchangeTokenActions,
} = createMonitoredSaga<ExchangeTokenParams>(exchangeToken, 'exchangeToken')
