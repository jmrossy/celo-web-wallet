import { FeeEstimate } from 'src/features/fees/types'

export interface LockedCeloBalances {
  locked: string
  pendingBlocked: string
  pendingFree: string
}

export enum LockActionType {
  Lock = 'lock',
  Unlock = 'unlock',
  Withdraw = 'withdraw',
}

export interface LockTokenParams {
  amountInWei: string
  action: LockActionType
  feeEstimates?: FeeEstimate[]
}
