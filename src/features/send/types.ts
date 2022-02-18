import { FeeEstimate } from 'src/features/fees/types'

export interface SendTokenParams {
  recipient: string
  amountInWei: string
  tokenAddress: string
  comment?: string
  feeEstimate?: FeeEstimate
}
