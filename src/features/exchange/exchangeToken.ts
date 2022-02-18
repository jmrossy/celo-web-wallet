import { BigNumber, Contract, providers } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getContractByAddress } from 'src/blockchain/contracts'
import { isSignerLedger } from 'src/blockchain/signer'
import { getCurrentNonce, sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import {
  EXCHANGE_RATE_STALE_TIME,
  MAX_EXCHANGE_LOSS,
  MAX_EXCHANGE_RATE,
  MAX_EXCHANGE_TOKEN_SIZE,
  MAX_EXCHANGE_TOKEN_SIZE_LEDGER,
  MIN_EXCHANGE_RATE,
} from 'src/consts'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/balances/fetchBalances'
import { Balances } from 'src/features/balances/types'
import { ExchangeTokenParams, SimpleExchangeRate } from 'src/features/exchange/types'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimates } from 'src/features/fees/utils'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TokenExchangeTx, TransactionType } from 'src/features/types'
import { CELO, NativeTokens, Token } from 'src/tokens'
import {
  fromWei,
  getAdjustedAmountFromBalances,
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
  let errors: ErrorState = { isValid: true }
  const { amountInWei, fromTokenId, toTokenId, feeEstimates, exchangeRate } = params
  const fromToken = NativeTokens[fromTokenId]
  const toToken = NativeTokens[toTokenId]

  if (!fromToken) {
    logger.error(`Invalid from token: ${fromTokenId}`)
    return invalidInput('fromTokenId', 'Invalid from currency')
  }
  if (!toToken) {
    logger.error(`Invalid to token: ${toTokenId}`)
    return invalidInput('toTokenId', 'Invalid to currency')
  }

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
      ...validateAmount(
        amountInWei,
        fromToken,
        balances,
        maxAmount,
        undefined,
        'Exceeds max, see settings'
      ),
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
      ...validateFeeEstimates(feeEstimates),
      ...validateAmountWithFees(amountInWei, fromToken, balances, feeEstimates),
    }
  }

  return errors
}

export function validateExchangeRate(exchangeRate?: SimpleExchangeRate): ErrorState | null {
  if (!exchangeRate) {
    return { isValid: false, fee: { error: true, helpText: 'No exchange rate set' } }
  }

  const { rate, lastUpdated } = exchangeRate

  if (!rate || rate < MIN_EXCHANGE_RATE) {
    logger.error(`Exchange rate seems too low: ${rate}`)
    return { isValid: false, fee: { error: true, helpText: 'Exchange rate seems too low' } }
  }
  if (rate > MAX_EXCHANGE_RATE) {
    logger.error(`Exchange rate seems too high: ${rate}`)
    return { isValid: false, fee: { error: true, helpText: 'Exchange rate seems too high' } }
  }

  if (isStale(lastUpdated, EXCHANGE_RATE_STALE_TIME * 3)) {
    logger.error(`Exchange rate too stale: ${lastUpdated}`)
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

  const { amountInWei, fromTokenId, toTokenId, feeEstimates, exchangeRate } = params
  logger.info(`Exchanging ${amountInWei} ${fromTokenId}`)

  if (feeEstimates?.length !== 2) throw new Error('Fee estimates not provided correctly')
  if (!exchangeRate) throw new Error('Exchange rate not provided correctly')

  const fromToken = NativeTokens[fromTokenId]
  const toToken = NativeTokens[toTokenId]
  const stableToken = fromToken.address === CELO.address ? toToken : fromToken
  const fromTokenContract = getContractByAddress(fromToken.address)
  if (!fromTokenContract) throw new Error(`No token contract found for ${fromToken.symbol}`)
  const exchangeAddress = stableToken.exchangeAddress
  if (!exchangeAddress) throw new Error(`Token ${stableToken.symbol} has no known exchange address`)
  const exchangeContract = getContractByAddress(exchangeAddress)
  if (!exchangeContract) throw new Error(`No exchange contract found for ${stableToken.symbol}`)

  // Need to account for case where user intends to exchange entire balance
  const adjustedAmount = getAdjustedAmountFromBalances(
    amountInWei,
    fromToken,
    balances,
    feeEstimates
  )
  const minBuyAmount = getMinBuyAmount(adjustedAmount, exchangeRate)

  const signedApproveTx = yield* call(
    createApproveTx,
    adjustedAmount,
    fromTokenContract,
    exchangeAddress,
    feeEstimates[0]
  )
  yield* put(setNumSignatures(1))

  const signedExchangeTx = yield* call(
    createExchangeTx,
    adjustedAmount,
    fromToken,
    exchangeContract,
    minBuyAmount,
    feeEstimates[1]
  )
  yield* put(setNumSignatures(2))

  const txReceipt = yield* call(executeExchange, signedApproveTx, signedExchangeTx)

  // TODO consider making a placeholder for the approval as well
  const placeholderTx = getExchangePlaceholderTx(
    adjustedAmount,
    fromToken,
    toToken,
    feeEstimates[1],
    txReceipt,
    minBuyAmount
  )
  yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createApproveTx(
  amountInWei: BigNumber,
  fromTokenContract: Contract,
  exchangeContractAddress: string,
  feeEstimate: FeeEstimate
) {
  const txRequest = await fromTokenContract.populateTransaction.approve(
    exchangeContractAddress,
    amountInWei
  )
  logger.info(`Signing approval tx for ${amountInWei} to ${exchangeContractAddress}`)
  return signTransaction(txRequest, feeEstimate)
}

async function createExchangeTx(
  amountInWei: BigNumber,
  fromToken: Token,
  exchangeContract: Contract,
  minBuyAmount: BigNumber,
  feeEstimate: FeeEstimate
) {
  const txRequest = await exchangeContract.populateTransaction.sell(
    amountInWei,
    minBuyAmount,
    fromToken.address === CELO.address
  )

  // For a smoother experience on Ledger, the approval and exchange txs
  // are both created and signed before sending. This requires the exchange tx
  // have it's nonce set manually:
  const currentNonce = await getCurrentNonce()
  txRequest.nonce = currentNonce + 1

  logger.info('Signing exchange tx')
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
  fromToken: Token,
  toToken: Token,
  feeEstimate: FeeEstimate,
  txReceipt: providers.TransactionReceipt,
  minBuyAmount: BigNumber
): TokenExchangeTx {
  return {
    ...createPlaceholderForTx(txReceipt, amountInWei.toString(), feeEstimate),
    type: TransactionType.TokenExchange,
    fromTokenId: fromToken.symbol,
    toTokenId: toToken.symbol,
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

function getMinBuyAmount(amountInWei: BigNumber, exchangeRate: SimpleExchangeRate) {
  // Allow a small wiggle room to increase success rate even if
  // rate changes slightly before tx goes out
  return toWei(fromWei(amountInWei) * exchangeRate.rate * (1 - MAX_EXCHANGE_LOSS))
}
