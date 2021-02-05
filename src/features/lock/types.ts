import { FeeEstimate } from 'src/features/fees/types'

export interface PendingWithdrawal {
  index: number
  value: string
  timestamp: number // Time when the funds are available
}

export interface LockedCeloBalances {
  locked: string
  pendingBlocked: string
  pendingFree: string
}

export interface LockedCeloStatus extends LockedCeloBalances {
  pendingWithdrawals: Array<PendingWithdrawal>
  isAccountRegistered: boolean
}

export enum LockActionType {
  Lock = 'lock',
  Unlock = 'unlock',
  Withdraw = 'withdraw',
}

export function lockActionLabel(type: LockActionType, activeTense = false) {
  if (type === LockActionType.Lock) {
    return activeTense ? 'Locking' : 'Lock'
  } else if (type === LockActionType.Unlock) {
    return activeTense ? 'Unlocking' : 'Unlock'
  } else if (type === LockActionType.Withdraw) {
    return activeTense ? 'Withdrawing' : 'Withdraw'
  } else {
    throw new Error(`Invalid lock action type: ${type}`)
  }
}

export interface LockTokenParams {
  amountInWei: string
  action: LockActionType
  feeEstimates?: FeeEstimate[]
}
