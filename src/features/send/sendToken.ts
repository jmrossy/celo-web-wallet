import { BigNumber, utils } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { sendTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { Currency, MAX_COMMENT_CHAR_LENGTH, MAX_SEND_TOKEN_SIZE } from 'src/consts'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput } from 'src/utils/validation'
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
    if (!isAmountValid(amountInWei, currency, balances, MAX_SEND_TOKEN_SIZE)) {
      errors = { ...errors, ...invalidInput('amount', 'Invalid Amount') }
    }
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
      ...validateFeeEstimate(feeEstimate),
      ...errors,
    }
  }

  return errors
}

function* sendToken(params: SendTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  const validateResult = yield* call(validate, params, balances, true)
  if (!validateResult.isValid) {
    throw new Error('Invalid Transaction') //TODO: provide the details of the invalid transaction
  }

  yield* call(_sendToken, params)
  yield* put(fetchBalancesActions.trigger())
}

async function _sendToken(params: SendTokenParams) {
  const { recipient, amountInWei, currency, comment, feeEstimate } = params

  const tx = await getTokenTransferTx(currency, recipient, BigNumber.from(amountInWei), comment)
  logger.info(`Sending ${amountInWei} ${currency} to ${recipient}`)
  const txReceipt = await sendTransaction(tx, feeEstimate)
  logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)
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
      return goldToken.populateTransaction.transferWithComment(recipient, amountInWei, comment)
    } else {
      return {
        to: recipient,
        value: amountInWei,
      }
    }
  } else if (currency === Currency.cUSD) {
    const stableToken = await getContract(CeloContract.StableToken)
    if (comment) {
      return stableToken.populateTransaction.transferWithComment(recipient, amountInWei, comment)
    } else {
      return stableToken.populateTransaction.transfer(recipient, amountInWei)
    }
  } else {
    throw new Error(`Unsupported currency: ${currency}`)
  }
}

export const {
  name: sendTokenSagaName,
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
