import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getSigner } from 'src/blockchain/signer'
import { signTransaction } from 'src/blockchain/transaction'
import { executeTxPlan, TxPlanExecutor } from 'src/blockchain/txPlan'
import { CeloContract } from 'src/config'
import { MIN_LOCK_AMOUNT } from 'src/consts'
import { Currency } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimates } from 'src/features/fees/utils'
import { LockActionType, LockTokenParams, PendingWithdrawal } from 'src/features/lock/types'
import { getTotalUnlockedCelo } from 'src/features/lock/utils'
import { TransactionType } from 'src/features/types'
import { GroupVotes } from 'src/features/validators/types'
import { getTotalNonvotingLocked } from 'src/features/validators/utils'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import {
  BigNumberMin,
  getAdjustedAmount,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: LockTokenParams,
  balances: Balances,
  groupVotes: GroupVotes,
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
    errors = {
      ...errors,
      ...validateAmount(amountInWei, Currency.CELO, adjustedBalances, undefined, MIN_LOCK_AMOUNT),
    }

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

  // Ensure user isn't trying to unlock CELO used for staking
  if (action === LockActionType.Unlock) {
    const nonVotingLocked = getTotalNonvotingLocked(balances, groupVotes)
    if (nonVotingLocked.lt(amountInWei)) {
      errors = {
        ...errors,
        ...invalidInput('stakedCelo', 'Locked funds in use for staking'),
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
  const groupVotes = yield* select((state: RootState) => state.validators.groupVotes)

  validateOrThrow(() => validate(params, balances, groupVotes, true), 'Invalid transaction')

  if (action === LockActionType.Unlock) {
    yield* call(ensureAccountNotGovernanceVoting)
  }

  const txPlan = getLockActionTxPlan(params, pendingWithdrawals, balances, isAccountRegistered)
  if (!feeEstimates || feeEstimates.length !== txPlan.length) {
    throw new Error('Fee estimates missing or do not match txPlan')
  }

  logger.info(`Executing ${action} for ${amountInWei} CELO`)
  yield* call<TxPlanExecutor<LockTokenTxPlanItem>>(
    executeTxPlan,
    txPlan,
    feeEstimates,
    createActionTx,
    'lockToken'
  )

  yield* put(fetchBalancesActions.trigger())
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
  balances: Balances,
  isAccountRegistered: boolean
): LockTokenTxPlan {
  const { action, amountInWei } = params

  if (action === LockActionType.Unlock) {
    // If only all three cases where this simple :)
    const adjutedAmount = getAdjustedAmount(amountInWei, balances.lockedCelo.locked, Currency.CELO)
    return [{ type: TransactionType.UnlockCelo, amountInWei: adjutedAmount.toString() }]
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
      if (amountRemaining.lte(MIN_LOCK_AMOUNT)) break
      const txAmount = BigNumberMin(amountRemaining, BigNumber.from(p.value))
      const adjustedAmount = getAdjustedAmount(txAmount, p.value, Currency.CELO)
      txs.push({
        type: TransactionType.RelockCelo,
        pendingWithdrawal: p,
        amountInWei: adjustedAmount.toString(),
      })
      amountRemaining = amountRemaining.sub(adjustedAmount)
    }
    // If pending relocks didn't cover it
    if (amountRemaining.gt(MIN_LOCK_AMOUNT)) {
      txs.push({ type: TransactionType.LockCelo, amountInWei: amountRemaining.toString() })
    }
    return txs
  } else if (action === LockActionType.Withdraw) {
    const txs: LockTokenTxPlan = []
    const now = Date.now()
    // Withdraw all available pendings
    for (const p of pendingWithdrawals) {
      if (p.timestamp <= now)
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
  const tx = await lockedGold.populateTransaction.withdraw(pendingWithdrawal.index)
  tx.nonce = nonce
  logger.info('Signing withdraw celo tx')
  return signTransaction(tx, feeEstimate)
}

async function ensureAccountNotGovernanceVoting() {
  const governance = getContract(CeloContract.Governance)
  const address = getSigner().signer.address
  const isVoting: boolean = await governance.isVoting(address)
  if (isVoting)
    throw new Error(
      'Cannot unlock CELO when account has voted for an active governance proposal. You must wait until the proposal is done.'
    )
}

export const {
  name: lockTokenSagaName,
  wrappedSaga: lockTokenSaga,
  reducer: lockTokenReducer,
  actions: lockTokenActions,
} = createMonitoredSaga<LockTokenParams>(lockToken, 'lockToken')
