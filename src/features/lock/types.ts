import { FeeEstimate } from 'src/features/fees/types'

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
