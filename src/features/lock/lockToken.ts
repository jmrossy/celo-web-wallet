import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getSigner } from 'src/blockchain/signer'
import { getCurrentNonce, sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { Currency } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimates } from 'src/features/fees/utils'
import { LockActionType, LockTokenParams, PendingWithdrawal } from 'src/features/lock/types'
import { getTotalUnlockedCelo } from 'src/features/lock/utils'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { BigNumberMin, validateAmount, validateAmountWithFees } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: LockTokenParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { amountInWei, action, feeEstimates } = params
  let errors: ErrorState = { isValid: true }

  if (!Object.values(LockActionType).includes(action)) {
    errors = { ...errors, ...invalidInput('action', 'Invalid Action Type') }
  }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const adjustedBalances = { ...balances }
    if (action === LockActionType.Lock) {
      adjustedBalances.celo = getTotalUnlockedCelo(balances).toString()
    } else if (action === LockActionType.Unlock) {
      adjustedBalances.celo = balances.lockedCelo.locked
    } else if (action === LockActionType.Withdraw) {
      adjustedBalances.celo = balances.lockedCelo.pendingFree
    }
    errors = { ...errors, ...validateAmount(amountInWei, Currency.CELO, adjustedBalances) }

    // Special case handling for withdraw which is confusing
    if (
      action === LockActionType.Withdraw &&
      BigNumber.from(balances.lockedCelo.pendingFree).lte(0)
    ) {
      errors = {
        ...errors,
        ...invalidInput('amount', 'No pending available to withdraw'),
      }
    }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimates(feeEstimates),
      ...validateAmountWithFees(amountInWei, Currency.CELO, balances, feeEstimates),
    }
  }

  return errors
}

function* lockToken(params: LockTokenParams) {
  const { amountInWei, action, feeEstimates } = params

  const balances = yield* call(fetchBalancesIfStale)
  const { pendingWithdrawals, isAccountRegistered } = yield* select(
    (state: RootState) => state.lock
  )

  validateOrThrow(() => validate(params, balances, true), 'Invalid transaction')

  const txPlan = getLockActionTxPlan(params, pendingWithdrawals, isAccountRegistered)
  if (!feeEstimates || feeEstimates.length !== txPlan.length) {
    throw new Error('Fee estimates missing or do not match txPlan')
  }

  logger.info(`Executing ${action} for ${amountInWei} CELO`)
  yield* call(executeLockTokenTxPlan, action, txPlan, feeEstimates)

  yield* put(fetchBalancesActions.trigger())
}

function* executeLockTokenTxPlan(
  action: string,
  txPlan: LockTokenTxPlan,
  feeEstimates: FeeEstimate[]
) {
  const signedTxs: string[] = []
  const currentNonce = yield* call(getCurrentNonce)

  for (let i = 0; i < txPlan.length; i++) {
    const tx = txPlan[i]
    const feeEstimate = feeEstimates[i]
    const signedTx = yield* call(createActionTx, tx, feeEstimate, currentNonce + i)
    signedTxs.push(signedTx)
    yield* put(setNumSignatures(i + 1))
  }

  for (let i = 0; i < signedTxs.length; i++) {
    logger.info(`Sending ${action} token tx ${i + 1} of ${signedTxs.length}`)
    const txReceipt = yield* call(sendSignedTransaction, signedTxs[i])
    logger.info(`${action} token tx has received: ${txReceipt.transactionHash}`)
    // TODO add placeholder txs
    // const placeholderTx = getPlaceholderTx(params, txReceipt, type)
    // yield* put(addPlaceholderTransaction(placeholderTx))
  }
}

function createActionTx(txPlanItem: LockTokenTxPlanItem, feeEstimate: FeeEstimate, nonce: number) {
  if (txPlanItem.type === TransactionType.AccountRegistration) {
    return createAccountRegisterTx(feeEstimate, nonce)
  } else if (txPlanItem.type === TransactionType.LockCelo) {
    return createLockCeloTx(txPlanItem, feeEstimate, nonce)
  } else if (txPlanItem.type === TransactionType.RelockCelo) {
    return createRelockCeloTx(txPlanItem, feeEstimate, nonce)
  } else if (txPlanItem.type === TransactionType.UnlockCelo) {
    return createUnlockCeloTx(txPlanItem, feeEstimate, nonce)
  } else if (txPlanItem.type === TransactionType.WithdrawLockedCelo) {
    return createWithdrawCeloTx(txPlanItem, feeEstimate, nonce)
  } else {
    throw new Error(`Invalid tx type for lock request: ${txPlanItem.type}`)
  }
}

interface LockTokenTxPlanItem {
  type: TransactionType
  amountInWei: string
  pendingWithdrawal?: PendingWithdrawal
}

type LockTokenTxPlan = Array<LockTokenTxPlanItem>

// Lock token operations can require varying numbers of txs in specific order
// This determines the ideal tx types and order
export function getLockActionTxPlan(
  params: LockTokenParams,
  pendingWithdrawals: PendingWithdrawal[],
  isAccountRegistered: boolean
): LockTokenTxPlan {
  const { action, amountInWei } = params

  if (action === LockActionType.Unlock) {
    // If only all three cases where this simple :)
    return [{ type: TransactionType.UnlockCelo, amountInWei }]
  } else if (action === LockActionType.Lock) {
    const txs: LockTokenTxPlan = []

    if (!isAccountRegistered) {
      txs.push({ type: TransactionType.AccountRegistration, amountInWei: '0' })
    }

    // Need relock from the pendings in reverse order
    // due to the way the storage is managed in the contract
    let amountRemaining = BigNumber.from(amountInWei)
    const pwSorted = pendingWithdrawals.sort((a, b) => b.index - a.index)
    for (const p of pwSorted) {
      if (amountRemaining.lte(0)) break
      const txAmount = BigNumberMin(amountRemaining, BigNumber.from(p.value))
      txs.push({
        type: TransactionType.RelockCelo,
        pendingWithdrawal: p,
        amountInWei: txAmount.toString(),
      })
      amountRemaining = amountRemaining.sub(txAmount)
    }
    // If pending relocks didn't cover it
    if (amountRemaining.gt(0)) {
      txs.push({ type: TransactionType.LockCelo, amountInWei: amountRemaining.toString() })
    }
    return txs
  } else if (action === LockActionType.Withdraw) {
    const txs: LockTokenTxPlan = []
    const now = Date.now()
    // Withdraw all available pendings
    for (const p of pendingWithdrawals) {
      if (p.timestamp >= now)
        txs.push({
          type: TransactionType.WithdrawLockedCelo,
          pendingWithdrawal: p,
          amountInWei: p.value,
        })
    }
    return txs
  } else {
    throw new Error(`Invalid lockToken tx type: ${action}`)
  }
}

async function createAccountRegisterTx(feeEstimate: FeeEstimate, nonce: number) {
  const address = getSigner().signer.address
  const accounts = getContract(CeloContract.Accounts)
  const isRegisteredAccount = await accounts.isAccount(address)
  if (isRegisteredAccount) {
    throw new Error('Attempting to register account that already exists')
  }

  /**
   * Just using createAccount for now but if/when DEKs are
   * supported than using setAccount here would make sense.
   * Can't use DEKs until comment encryption is added
   * because Valora assumes any recipient with a DEK is also Valora.
   */
  const tx = await accounts.populateTransaction.createAccount()
  tx.nonce = nonce
  logger.info('Signing account register tx')
  return signTransaction(tx, feeEstimate)
}

async function createLockCeloTx(
  txPlanItem: LockTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number
) {
  const lockedGold = getContract(CeloContract.LockedGold)
  const tx = await lockedGold.populateTransaction.lock()
  tx.value = BigNumber.from(txPlanItem.amountInWei)
  tx.nonce = nonce
  logger.info('Signing lock celo tx')
  return signTransaction(tx, feeEstimate)
}

async function createRelockCeloTx(
  txPlanItem: LockTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number
) {
  const { amountInWei, pendingWithdrawal } = txPlanItem
  if (!pendingWithdrawal) throw new Error('Pending withdrawal missing from relock tx')
  const lockedGold = getContract(CeloContract.LockedGold)
  const tx = await lockedGold.populateTransaction.relock(pendingWithdrawal.index, amountInWei)
  tx.nonce = nonce
  logger.info('Signing relock celo tx')
  return signTransaction(tx, feeEstimate)
}

async function createUnlockCeloTx(
  txPlanItem: LockTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number
) {
  const { amountInWei } = txPlanItem
  const lockedGold = getContract(CeloContract.LockedGold)
  const tx = await lockedGold.populateTransaction.unlock(amountInWei)
  tx.nonce = nonce
  logger.info('Signing unlock celo tx')
  return signTransaction(tx, feeEstimate)
}

async function createWithdrawCeloTx(
  txPlanItem: LockTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number
) {
  const { pendingWithdrawal } = txPlanItem
  if (!pendingWithdrawal) throw new Error('Pending withdrawal missing from withdraw tx')
  const lockedGold = getContract(CeloContract.LockedGold)
  //TODO remove
  const lock = await getSigner().signer.estimateGas(
    await lockedGold.populateTransaction.withdraw(pendingWithdrawal.index)
  )
  console.info('===withdraw gas:' + lock.toString())
  const tx = await lockedGold.populateTransaction.withdraw(pendingWithdrawal.index)
  tx.nonce = nonce
  logger.info('Signing withdraw celo tx')
  return signTransaction(tx, feeEstimate)
}

export const {
  name: lockTokenSagaName,
  wrappedSaga: lockTokenSaga,
  reducer: lockTokenReducer,
  actions: lockTokenActions,
} = createMonitoredSaga<LockTokenParams>(lockToken, 'lockToken')
