import { BigNumber, providers, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContractByAddress, getTokenContract } from 'src/blockchain/contracts'
import { isSignerLedger } from 'src/blockchain/signer'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import {
  MAX_COMMENT_CHAR_LENGTH,
  MAX_SEND_TOKEN_SIZE,
  MAX_SEND_TOKEN_SIZE_LEDGER,
} from 'src/consts'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { SendTokenParams } from 'src/features/send/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TokenTransfer, TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { CELO, isNativeToken, Token } from 'src/tokens'
import {
  getAdjustedAmountFromBalances,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: SendTokenParams,
  balances: Balances,
  validateMaxAmount = true,
  validateFee = false
): ErrorState {
  const { recipient, amountInWei, tokenId, comment, feeEstimate } = params
  const token = balances.tokens[tokenId]
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else if (!tokenId || !token) {
    errors = { ...errors, ...invalidInput('tokenId', 'Invalid Currency') }
  } else {
    const maxAmount = validateMaxAmount
      ? isSignerLedger()
        ? MAX_SEND_TOKEN_SIZE_LEDGER
        : MAX_SEND_TOKEN_SIZE
      : undefined
    errors = { ...errors, ...validateAmount(amountInWei, token, balances, maxAmount) }
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

  if (comment) {
    if (!isNativeToken(params.tokenId)) {
      logger.error('Using comment for non-native token')
      errors = {
        ...errors,
        ...invalidInput('comment', 'Comments disabled for custom tokens'),
      }
    } else if (comment.length > MAX_COMMENT_CHAR_LENGTH) {
      logger.error(`Comment too long: ${comment}`)
      errors = {
        ...errors,
        ...invalidInput('comment', 'Comment is too long'),
      }
    }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimate),
      ...validateAmountWithFees(
        amountInWei,
        token,
        balances,
        feeEstimate ? [feeEstimate] : undefined
      ),
    }
  }

  return errors
}

function* sendToken(params: SendTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)
  const txSizeLimitEnabled = yield* select((state: RootState) => state.settings.txSizeLimitEnabled)

  validateOrThrow(() => validate(params, balances, txSizeLimitEnabled, true), 'Invalid transaction')

  const { signedTx, type, token } = yield* call(createSendTx, params, balances)
  yield* put(setNumSignatures(1))

  const txReceipt = yield* call(sendSignedTransaction, signedTx)
  logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  const placeholderTx = getPlaceholderTx(params, token, type, txReceipt)
  yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createSendTx(params: SendTokenParams, balances: Balances) {
  const { recipient, amountInWei, tokenId, comment, feeEstimate } = params
  const token = balances.tokens[tokenId]
  if (!feeEstimate) throw new Error('Fee estimate is missing')

  // Need to account for case where user intends to send entire balance
  const adjustedAmount = getAdjustedAmountFromBalances(amountInWei, token, balances, [feeEstimate])

  const type = getTokenTransferType(params)
  const tx = await getTokenTransferTx(type, token, recipient, adjustedAmount, comment)

  logger.info(`Signing tx to send ${amountInWei} ${token.id} to ${recipient}`)
  const signedTx = await signTransaction(tx, feeEstimate)
  return { signedTx, type, token }
}

export function getTokenTransferType(params: SendTokenParams): TransactionType {
  const { tokenId, comment } = params
  if (tokenId === CELO.id) {
    if (!comment) return TransactionType.CeloNativeTransfer
    else return TransactionType.CeloTokenTransferWithComment
  } else if (isNativeToken(tokenId)) {
    if (!comment) return TransactionType.StableTokenTransfer
    else return TransactionType.StableTokenTransferWithComment
  } else {
    return TransactionType.OtherTokenTransfer
  }
}

function getTokenTransferTx(
  type: TransactionType,
  token: Token,
  recipient: string,
  amountInWei: BigNumber,
  comment?: string
) {
  if (type === TransactionType.CeloNativeTransfer) {
    return createNativeCeloTransferTx(recipient, amountInWei)
  }
  if (
    type === TransactionType.CeloTokenTransfer ||
    type === TransactionType.StableTokenTransfer ||
    type === TransactionType.OtherTokenTransfer
  ) {
    return createTransferTx(token, recipient, amountInWei)
  }
  if (
    type === TransactionType.CeloTokenTransferWithComment ||
    type === TransactionType.StableTokenTransferWithComment
  ) {
    return createTransferWithCommentTx(token, recipient, amountInWei, comment)
  }
  throw new Error(`Invalid tx type: ${type}`)
}

function createNativeCeloTransferTx(recipient: string, amountInWei: BigNumber) {
  // Using 'raw' tx instead of smart contract call to save on gas fees
  return {
    to: recipient,
    value: amountInWei,
  }
}

export function createTransferTx(token: Token, recipient: string, amountInWei: BigNumber) {
  let contract
  if (isNativeToken(token.id)) {
    contract = getContractByAddress(token.address)
  } else {
    contract = getTokenContract(token.address)
  }
  if (!contract) throw new Error(`No contract found for token ${token.id}`)
  return contract.populateTransaction.transfer(recipient, amountInWei)
}

function createTransferWithCommentTx(
  token: Token,
  recipient: string,
  amountInWei: BigNumber,
  comment?: string
) {
  if (!comment) throw new Error('Attempting to use transferWithComment but comment is empty')
  const contract = getContractByAddress(token.address)
  if (!contract) throw new Error(`No contract found for token ${token.id}`)
  return contract.populateTransaction.transferWithComment(recipient, amountInWei, comment)
}

function getPlaceholderTx(
  params: SendTokenParams,
  token: Token,
  type: TransactionType,
  txReceipt: providers.TransactionReceipt
): TokenTransfer {
  if (
    type !== TransactionType.StableTokenTransfer &&
    type !== TransactionType.CeloTokenTransfer &&
    type !== TransactionType.StableTokenTransferWithComment &&
    type !== TransactionType.CeloTokenTransferWithComment &&
    type !== TransactionType.CeloNativeTransfer &&
    type !== TransactionType.OtherTokenTransfer
  ) {
    throw new Error('Invalid tx type for placeholder')
  }

  // A small hack because the txs in the feed don't distinguish
  // between transfers with comments and ones without
  let adjustedType: TransactionType
  if (type === TransactionType.StableTokenTransferWithComment)
    adjustedType = TransactionType.StableTokenTransfer
  else if (type === TransactionType.CeloTokenTransferWithComment)
    adjustedType = TransactionType.CeloTokenTransfer
  else adjustedType = type

  return {
    ...createPlaceholderForTx(txReceipt, params.amountInWei, params.feeEstimate!),
    to: params.recipient,
    isOutgoing: true,
    comment: params.comment,
    type: adjustedType,
    tokenId: token.id,
  }
}

export const {
  name: sendTokenSagaName,
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
