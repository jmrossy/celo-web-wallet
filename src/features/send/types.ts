import { FeeEstimate } from 'src/features/fees/types'

export interface SendTokenParams {
  recipient: string
  amountInWei: string
  tokenAddress: Address
  comment?: string
  feeEstimate?: FeeEstimate
}
