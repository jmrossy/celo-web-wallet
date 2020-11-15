import { BigNumber, utils } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { sendTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { Currency, MAX_COMMENT_CHAR_LENGTH, MAX_SEND_TOKEN_SIZE } from 'src/consts'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/walletSlice'
import { isAmountValid } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput } from 'src/utils/validation'
import { call } from 'typed-redux-saga'

export interface SendTokenParams {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
  feeEstimate?: FeeEstimate
}

export function validate(
  params: SendTokenParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { recipient, amount, currency, comment, feeEstimate } = params
  let errors: ErrorState = { isValid: true }

  if (!amount) {
    errors = { ...errors, ...invalidInput('amount', 'Invalid Amount') }
  } else {
    const amountInWei = utils.parseEther('' + amount)
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
}

async function _sendToken(params: SendTokenParams) {
  const { recipient, amount, currency, comment, feeEstimate } = params
  const amountInWei = utils.parseEther('' + amount)

  const tx = await getTokenTransferTx(currency, recipient, amountInWei, comment)
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
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
