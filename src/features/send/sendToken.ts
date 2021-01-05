import { BigNumber, providers, utils } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { isSignerLedger } from 'src/blockchain/signer'
import { sendTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import {
  Currency,
  MAX_COMMENT_CHAR_LENGTH,
  MAX_SEND_TOKEN_SIZE,
  MAX_SEND_TOKEN_SIZE_LEDGER,
} from 'src/consts'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { TokenTransfer, TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { validateAmount, validateAmountWithFees } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, errorStateToString, invalidInput } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export interface SendTokenParams {
  recipient: string
  amountInWei: string
  currency: Currency
  comment?: string
  feeEstimate?: FeeEstimate
}

export function validate(
  params: SendTokenParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { recipient, amountInWei, currency, comment, feeEstimate } = params
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const maxAmount = isSignerLedger() ? MAX_SEND_TOKEN_SIZE_LEDGER : MAX_SEND_TOKEN_SIZE
    errors = { ...errors, ...validateAmount(amountInWei, currency, balances, maxAmount) }
  }

  if (!utils.isAddress(recipient)) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Invalid Recipient'),
    }
  } else if (!recipient) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Recipient is required'),
    }
  }

  if (comment && comment.length > MAX_COMMENT_CHAR_LENGTH) {
    logger.error(`Invalid comment: ${comment}`)
    errors = {
      ...errors,
      ...invalidInput('comment', 'Comment is too long'),
    }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimate),
      ...validateAmountWithFees(
        amountInWei,
        currency,
        balances,
        feeEstimate ? [feeEstimate] : undefined
      ),
    }
  }

  return errors
}

function* sendToken(params: SendTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  const validateResult = yield* call(validate, params, balances, true)
  if (!validateResult.isValid) {
    throw new Error(errorStateToString(validateResult, 'Invalid transaction'))
  }

  const placeholderTx = yield* call(_sendToken, params)
  yield* put(addPlaceholderTransaction(placeholderTx))
  yield* put(fetchBalancesActions.trigger())
}

async function _sendToken(params: SendTokenParams) {
  const { recipient, amountInWei, currency, comment, feeEstimate } = params

  const { tx, type } = await getTokenTransferTx(
    currency,
    recipient,
    BigNumber.from(amountInWei),
    comment
  )
  logger.info(`Sending ${amountInWei} ${currency} to ${recipient}`)
  const txReceipt = await sendTransaction(tx, feeEstimate)
  logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)
  return getPlaceholderTx(params, txReceipt, type)
}

async function getTokenTransferTx(
  currency: Currency,
  recipient: string,
  amountInWei: BigNumber,
  comment?: string
) {
  if (currency === Currency.CELO) {
    if (comment) {
      const goldToken = await getContract(CeloContract.GoldToken)
      const tx = await goldToken.populateTransaction.transferWithComment(
        recipient,
        amountInWei,
        comment
      )
      return { tx, type: TransactionType.CeloTokenTransfer }
    } else {
      return {
        tx: {
          to: recipient,
          value: amountInWei,
        },
        type: TransactionType.CeloTokenTransfer,
      }
    }
  } else if (currency === Currency.cUSD) {
    const stableToken = await getContract(CeloContract.StableToken)
    if (comment) {
      const tx = await stableToken.populateTransaction.transferWithComment(
        recipient,
        amountInWei,
        comment
      )
      return { tx, type: TransactionType.StableTokenTransfer }
    } else {
      const tx = await stableToken.populateTransaction.transfer(recipient, amountInWei)
      return { tx, type: TransactionType.StableTokenTransfer }
    }
  } else {
    throw new Error(`Unsupported currency: ${currency}`)
  }
}

function getPlaceholderTx(
  params: SendTokenParams,
  txReceipt: providers.TransactionReceipt,
  type: TransactionType
): TokenTransfer {
  if (!params.feeEstimate) {
    throw new Error('Params must have fee estimate to create placeholder tx')
  }

  const base = {
    ...createPlaceholderForTx(txReceipt, params.amountInWei, params.feeEstimate),
    isOutgoing: true,
    comment: params.comment,
  }

  if (type === TransactionType.CeloTokenTransfer) {
    return {
      ...base,
      type: TransactionType.CeloTokenTransfer,
      to: params.recipient,
      currency: Currency.CELO,
    }
  }

  if (type === TransactionType.StableTokenTransfer) {
    return {
      ...base,
      type: TransactionType.StableTokenTransfer,
      to: params.recipient,
      currency: Currency.cUSD,
    }
  }

  throw new Error(`Unsupported placeholder type: ${type}`)
}

export const {
  name: sendTokenSagaName,
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
