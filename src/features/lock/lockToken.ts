import { providers } from 'ethers'
import { Currency } from 'src/currency'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { LockActionType, LockTokenParams } from 'src/features/lock/types'
import { TokenTransfer, TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { validateAmount, validateAmountWithFees } from 'src/utils/amount'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(
  params: LockTokenParams,
  balances: Balances,
  // TODO need lock balances too
  validateFee = false
): ErrorState {
  const { amountInWei, action, feeEstimate } = params
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    // TODO need lock balances too
    errors = { ...errors, ...validateAmount(amountInWei, Currency.CELO, balances) }
  }

  if (!(action in LockActionType)) {
    errors = { ...errors, ...invalidInput('action', 'Invalid Action Type') }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimate),
      ...validateAmountWithFees(
        amountInWei,
        Currency.CELO,
        balances,
        feeEstimate ? [feeEstimate] : undefined
      ),
    }
  }

  return errors
}

function* lockToken(params: LockTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  validateOrThrow(() => validate(params, balances, true), 'Invalid transaction')

  // const { signedTx, type } = yield* call(createSendTx, params, balances)
  // yield* put(setTransactionSigned(true))

  // const txReceipt = yield* call(sendSignedTransaction, signedTx)
  // logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  // const placeholderTx = getPlaceholderTx(params, txReceipt, type)
  // yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createLockTx(params: LockTokenParams, balances: Balances) {
  const { amountInWei, action, feeEstimate } = params
  if (!feeEstimate) throw new Error('Fee estimate is missing')

  // Need to account for case where user intends to send entire balance
  // const adjustedAmount = getAdjustedAmount(amountInWei, currency, balances, [feeEstimate])

  // const goldToken = await getContract(CeloContract.GoldToken)
  // const tx = await goldToken.populateTransaction.transferWithComment(
  //   recipient,
  //   amountInWei,
  //   comment
  // )
  // return { tx, type: TransactionType.CeloTokenTransfer }

  // logger.info(`Sending ${amountInWei} ${currency} to ${recipient}`)
  // const signedTx = await signTransaction(tx, feeEstimate)
  // return { signedTx, type }
}

function getPlaceholderTx(
  params: LockTokenParams,
  txReceipt: providers.TransactionReceipt,
  type: TransactionType
): TokenTransfer {
  if (!params.feeEstimate) {
    throw new Error('Params must have fee estimate to create placeholder tx')
  }

  const base = {
    ...createPlaceholderForTx(txReceipt, params.amountInWei, params.feeEstimate),
    isOutgoing: true,
  }

  // if (type === TransactionType.CeloTokenTransfer) {
  //   return {
  //     ...base,
  //     type: TransactionType.CeloTokenTransfer,
  //     to: params.recipient,
  //     currency: Currency.CELO,
  //   }
  // }

  throw new Error(`Unsupported placeholder type: ${type}`)
}

export const {
  name: lockTokenSagaName,
  wrappedSaga: lockTokenSaga,
  reducer: lockTokenReducer,
  actions: lockTokenActions,
} = createMonitoredSaga<LockTokenParams>(lockToken, 'lockToken')
