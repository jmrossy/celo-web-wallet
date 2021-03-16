import { BigNumber, Contract, providers, utils } from 'ethers'
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

  const { tx, type } = await getTokenTransferTx(token, recipient, adjustedAmount, comment)

  logger.info(`Signing tx to send ${amountInWei} ${token.id} to ${recipient}`)
  const signedTx = await signTransaction(tx, feeEstimate)
  return { signedTx, type, token }
}

function getTokenTransferTx(
  token: Token,
  recipient: string,
  amountInWei: BigNumber,
  comment?: string
) {
  let contract: Contract | null

  if (token.id === CELO.id && !comment) {
    return createSimpleCeloTransferTx(recipient, amountInWei)
  } else if (isNativeToken(token.id)) {
    contract = getContractByAddress(token.address)
    if (!contract) throw new Error(`No contract found for token: ${token.id}`)
    if (comment) {
      return createTransferWithCommentTx(token, recipient, amountInWei, comment, contract)
    } else {
      return createTransferTx(token, recipient, amountInWei, contract)
    }
  } else {
    contract = getTokenContract(token.address)
    return createTransferTx(token, recipient, amountInWei, contract)
  }
}

function createSimpleCeloTransferTx(recipient: string, amountInWei: BigNumber) {
  // Using 'raw' tx instead of smart contract call to save on gas fees
  return {
    tx: {
      to: recipient,
      value: amountInWei,
    },
    type: TransactionType.CeloNativeTransfer,
  }
}

async function createTransferTx(
  token: Token,
  recipient: string,
  amountInWei: BigNumber,
  contract: Contract
) {
  const tx = await contract.populateTransaction.transfer(recipient, amountInWei)
  let type: TransactionType
  if (token.id === CELO.id) type = TransactionType.CeloTokenTransfer
  else if (isNativeToken(token.id)) type = TransactionType.StableTokenTransfer
  else type = TransactionType.OtherTokenTransfer
  return { tx, type }
}

async function createTransferWithCommentTx(
  token: Token,
  recipient: string,
  amountInWei: BigNumber,
  comment: string,
  contract: Contract
) {
  const tx = await contract.populateTransaction.transferWithComment(recipient, amountInWei, comment)
  // Note not using TransferWithComment type here because type is for the placeholder tx
  // and the feed doesn't currently distinguish btwn comment/non-comment types
  const type =
    token.id === CELO.id ? TransactionType.CeloTokenTransfer : TransactionType.StableTokenTransfer
  return { tx, type }
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
    type !== TransactionType.CeloNativeTransfer &&
    type !== TransactionType.OtherTokenTransfer
  ) {
    throw new Error('Invalid tx type for placeholder')
  }

  return {
    ...createPlaceholderForTx(txReceipt, params.amountInWei, params.feeEstimate!),
    to: params.recipient,
    isOutgoing: true,
    comment: params.comment,
    type,
    token,
  }
}

export const {
  name: sendTokenSagaName,
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
