import { FeeEstimate } from 'src/features/fees/types'

export interface LockedCeloBalances {
  locked: string
  pending: string
}

export enum LockActionType {
  Lock = 'lock',
  Unlock = 'unlock',
  Withdraw = 'withdraw',
}

export interface LockTokenParams {
  amountInWei: string
  action: LockActionType
  feeEstimate?: FeeEstimate
}
