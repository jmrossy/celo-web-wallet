import { FeeEstimate } from 'src/features/fees/types'

export interface SendTokenParams {
  recipient: string
  amountInWei: string
  tokenId: string
  comment?: string
  feeEstimate?: FeeEstimate
}
