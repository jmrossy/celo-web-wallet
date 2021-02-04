import { providers } from 'ethers'
import { getContract } from 'src/blockchain/contracts'
import { getSigner } from 'src/blockchain/signer'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { Currency } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { LockActionType, LockTokenParams } from 'src/features/lock/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TokenTransfer, TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { validateAmount, validateAmountWithFees } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(
  params: LockTokenParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { amountInWei, action, feeEstimates } = params
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
      //TODO
      // ...validateFeeEstimate(feeEstimates[0]),
      ...validateFeeEstimate(undefined),
      ...validateAmountWithFees(amountInWei, Currency.CELO, balances, feeEstimates),
    }
  }

  return errors
}

function* lockToken(params: LockTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)

  validateOrThrow(() => validate(params, balances, true), 'Invalid transaction')

  const { amountInWei, action, feeEstimates } = params
  if (!feeEstimates || !feeEstimates.length) {
    throw new Error('Fee estimates not provided correctly')
  }

  logger.info(`Executing ${action} for ${amountInWei} CELO`)
  if (action === LockActionType.Lock) {
    yield* call(lockCelo, amountInWei, balances, feeEstimates)
  } else if (action === LockActionType.Unlock) {
    yield* call(unlockCelo, amountInWei, balances, feeEstimates)
  } else if (action === LockActionType.Withdraw) {
    yield* call(withdrawCelo, amountInWei, balances, feeEstimates)
  }

  yield* put(fetchBalancesActions.trigger())
}

function* lockCelo(amountInWei: string, balances: Balances, feeEstimates: FeeEstimate[]) {
  const signedRegisterTx = yield* call(createAccountRegisterTx, feeEstimates[0])
  yield* put(setNumSignatures(1))

  // TODO create all needed lock/relock txs, sign them and update setNumSigs along the way

  if (signedRegisterTx) {
    logger.info('Sending account register tx')
    const txReceipt1 = yield* call(sendSignedTransaction, signedRegisterTx)
  }

  // TODO send all the lock txs
  // TODO placeholders for lock txs
  // const txReceipt = yield* call(sendSignedTransaction, signedTx)
  // logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  // const placeholderTx = getPlaceholderTx(params, txReceipt, type)
  // yield* put(addPlaceholderTransaction(placeholderTx))
}

function* unlockCelo(amountInWei: string, balances: Balances, feeEstimates: FeeEstimate[]) {
  //TODO
}

function* withdrawCelo(amountInWei: string, balances: Balances, feeEstimates: FeeEstimate[]) {
  //TODO
}

export async function createAccountRegisterTx(feeEstimate: FeeEstimate) {
  const address = getSigner().signer.address
  const accounts = getContract(CeloContract.Accounts)
  const isRegisteredAccount = await accounts.isAccount(address)
  if (isRegisteredAccount) {
    logger.debug('Account already exists, skipping registration')
    return null
  }

  /**
   * Just using createAccount for now but if/when DEKs are
   * supported than using setAccount here would make sense.
   * Can't use DEKs until comment encryption is added
   * because Valora assumes any recipient with a DEK is also Valora.
   */
  const tx = await accounts.populateTransaction.createAccount()
  logger.info('Registering new account for signer')
  return signTransaction(tx, feeEstimate)
}

function getPlaceholderTx(
  params: LockTokenParams,
  txReceipt: providers.TransactionReceipt,
  type: TransactionType
): TokenTransfer {
  // if (!params.feeEstimate) {
  //   throw new Error('Params must have fee estimate to create placeholder tx')
  // }

  // const base = {
  //   ...createPlaceholderForTx(txReceipt, params.amountInWei, params.feeEstimate),
  //   isOutgoing: true,
  // }

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
