import { BigNumber, Contract, providers } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { isSignerLedger } from 'src/blockchain/signer'
import { getCurrentNonce, sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import {
  EXCHANGE_RATE_STALE_TIME,
  MAX_EXCHANGE_TOKEN_SIZE,
  MAX_EXCHANGE_TOKEN_SIZE_LEDGER,
  MIN_EXCHANGE_RATE,
} from 'src/consts'
import { Currency, getOtherCurrency } from 'src/currency'
import { ExchangeRate, ExchangeTokenParams } from 'src/features/exchange/types'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TokenExchangeTx, TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import {
  fromWei,
  getAdjustedAmount,
  toWei,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: ExchangeTokenParams,
  balances: Balances,
  validateMaxAmount = true,
  validateRate = false,
  validateFee = false
): ErrorState {
  const { amountInWei, fromCurrency, feeEstimates, exchangeRate } = params
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const maxAmount = validateMaxAmount
      ? isSignerLedger()
        ? MAX_EXCHANGE_TOKEN_SIZE_LEDGER
        : MAX_EXCHANGE_TOKEN_SIZE
      : undefined
    errors = {
      ...errors,
      ...validateAmount(amountInWei, fromCurrency, balances, maxAmount),
    }
  }

  if (validateRate) {
    errors = {
      ...errors,
      ...validateExchangeRate(exchangeRate),
    }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimates && feeEstimates[0]),
      ...validateFeeEstimate(feeEstimates && feeEstimates[1]),
      ...validateAmountWithFees(amountInWei, fromCurrency, balances, feeEstimates),
    }
  }

  return errors
}

export function validateExchangeRate(exchangeRate?: ExchangeRate): ErrorState | null {
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

  return null
}

function* exchangeToken(params: ExchangeTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)
  const txSizeLimitEnabled = yield* select((state: RootState) => state.settings.txSizeLimitEnabled)

  validateOrThrow(
    () => validate(params, balances, txSizeLimitEnabled, true, true),
    'Invalid transaction'
  )

  const { amountInWei, fromCurrency, feeEstimates, exchangeRate } = params
  logger.info(`Exchanging ${amountInWei} ${fromCurrency}`)

  if (!feeEstimates || feeEstimates.length !== 2) {
    throw new Error('Fee estimates not provided correctly')
  }
  if (!exchangeRate) {
    throw new Error('Exchange rate not provided correctly')
  }

  // Need to account for case where user intends to send entire balance
  const adjustedAmount = getAdjustedAmount(amountInWei, fromCurrency, balances, feeEstimates)
  const minBuyAmount = getMinBuyAmount(adjustedAmount, exchangeRate)

  const signedApproveTx = yield* call(
    createApproveTx,
    adjustedAmount,
    fromCurrency,
    feeEstimates[0]
  )
  yield* put(setNumSignatures(1))

  const signedExchangeTx = yield* call(
    createExchangeTx,
    adjustedAmount,
    fromCurrency,
    minBuyAmount,
    feeEstimates[1]
  )
  yield* put(setNumSignatures(2))

  const txReceipt = yield* call(executeExchange, signedApproveTx, signedExchangeTx)

  // TODO consider making a placeholder for the approval as well
  const placeholderTx = getExchangePlaceholderTx(
    adjustedAmount,
    fromCurrency,
    feeEstimates[1],
    txReceipt,
    minBuyAmount
  )
  yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createApproveTx(
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
  return signTransaction(txRequest, feeEstimate)
}

async function createExchangeTx(
  amountInWei: BigNumber,
  fromCurrency: Currency,
  minBuyAmount: BigNumber,
  feeEstimate: FeeEstimate
) {
  const exchange = await getContract(CeloContract.Exchange)
  // TODO swap method for .sell once updated contract is live
  const txRequest = await exchange.populateTransaction.exchange(
    amountInWei,
    minBuyAmount,
    fromCurrency === Currency.CELO
  )

  // For a smoother experience on Ledger, the approval and exchange txs
  // are both created and signed before sending. This requires the exchange tx
  // have it's nonce set manually:
  const currentNonce = await getCurrentNonce()
  txRequest.nonce = currentNonce + 1

  const signedTx = await signTransaction(txRequest, feeEstimate)
  return signedTx
}

async function executeExchange(signedApproveTx: string, signedExchangeTx: string) {
  logger.info('Sending exchange approval tx')
  const txReceipt1 = await sendSignedTransaction(signedApproveTx)
  logger.info(`Exchange approval hash received: ${txReceipt1.transactionHash}`)

  logger.info('Sending exchange tx')
  const txReceipt2 = await sendSignedTransaction(signedExchangeTx)
  logger.info(`Exchange hash received: ${txReceipt2.transactionHash}`)
  return txReceipt2
}

function getExchangePlaceholderTx(
  amountInWei: BigNumber,
  fromCurrency: Currency,
  feeEstimate: FeeEstimate,
  txReceipt: providers.TransactionReceipt,
  minBuyAmount: BigNumber
): TokenExchangeTx {
  return {
    ...createPlaceholderForTx(txReceipt, amountInWei.toString(), feeEstimate),
    type: TransactionType.TokenExchange,
    fromToken: fromCurrency,
    toToken: getOtherCurrency(fromCurrency),
    fromValue: amountInWei.toString(),
    toValue: minBuyAmount.toString(),
  }
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
