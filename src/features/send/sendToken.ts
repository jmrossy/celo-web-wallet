import { BigNumber, providers } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { getContractByAddress, getTokenContract } from 'src/blockchain/contracts'
import { isSignerLedger } from 'src/blockchain/signer'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import {
  MAX_COMMENT_CHAR_LENGTH,
  MAX_SEND_TOKEN_SIZE,
  MAX_SEND_TOKEN_SIZE_LEDGER,
} from 'src/consts'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/balances/fetchBalances'
import { Balances } from 'src/features/balances/types'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { SendTokenParams } from 'src/features/send/types'
import { TokenMap } from 'src/features/tokens/types'
import { isNativeToken, isNativeTokenAddress } from 'src/features/tokens/utils'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TokenTransfer, TransactionType } from 'src/features/types'
import { CELO, Token } from 'src/tokens'
import { isValidAddress } from 'src/utils/addresses'
import {
  getAdjustedAmountFromBalances,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(
  params: SendTokenParams,
  balances: Balances,
  tokens: TokenMap,
  validateMaxAmount = true,
  validateFee = false
): ErrorState {
  const { recipient, amountInWei, tokenAddress, comment, feeEstimate } = params
  const token = tokens[tokenAddress]
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else if (!tokenAddress || !token) {
    errors = { ...errors, ...invalidInput('tokenId', 'Invalid Currency') }
  } else {
    const maxAmount = validateMaxAmount
      ? isSignerLedger()
        ? MAX_SEND_TOKEN_SIZE_LEDGER
        : MAX_SEND_TOKEN_SIZE
      : undefined
    errors = {
      ...errors,
      ...validateAmount(
        amountInWei,
        token,
        balances,
        maxAmount,
        undefined,
        'Exceeds max, see settings'
      ),
    }
  }

  if (!recipient) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Recipient is required'),
    }
  } else if (!isValidAddress(recipient)) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Invalid Recipient'),
    }
  }

  if (comment) {
    if (!isNativeToken(token)) {
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
  const tokens = yield* appSelect((state) => state.tokens.byAddress)
  const txSizeLimitEnabled = yield* appSelect((state) => state.settings.txSizeLimitEnabled)

  validateOrThrow(
    () => validate(params, balances, tokens, txSizeLimitEnabled, true),
    'Invalid transaction'
  )

  const { signedTx, type, token } = yield* call(createSendTx, params, balances, tokens)
  yield* put(setNumSignatures(1))

  const txReceipt = yield* call(sendSignedTransaction, signedTx)
  logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  const placeholderTx = getPlaceholderTx(params, token, type, txReceipt)
  yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createSendTx(params: SendTokenParams, balances: Balances, tokens: TokenMap) {
  const { recipient, amountInWei, tokenAddress, comment, feeEstimate } = params
  const token = tokens[tokenAddress]
  if (!feeEstimate) throw new Error('Fee estimate is missing')

  // Need to account for case where user intends to send entire balance
  const adjustedAmount = getAdjustedAmountFromBalances(amountInWei, token, balances, [feeEstimate])

  const type = getTokenTransferType(params)
  const tx = await getTokenTransferTx(type, token, recipient, adjustedAmount, comment)

  logger.info(`Signing tx to send ${amountInWei} ${token.symbol} to ${recipient}`)
  const signedTx = await signTransaction(tx, feeEstimate)
  return { signedTx, type, token }
}

export function getTokenTransferType(params: SendTokenParams): TransactionType {
  const { tokenAddress, comment } = params
  if (tokenAddress === CELO.address) {
    if (!comment) return TransactionType.CeloNativeTransfer
    else return TransactionType.CeloTokenTransferWithComment
  } else if (isNativeTokenAddress(tokenAddress)) {
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
  if (isNativeToken(token)) {
    contract = getContractByAddress(token.address)
  } else {
    contract = getTokenContract(token.address)
  }
  if (!contract) throw new Error(`No contract found for token ${token.address}`)
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
  if (!contract) throw new Error(`No contract found for token ${token.address}`)
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
    tokenId: token.address,
  }
}

export const {
  name: sendTokenSagaName,
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
