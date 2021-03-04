import { Currency } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'

export interface SendTokenParams {
  recipient: string
  amountInWei: string
  currency: Currency
  comment?: string
  feeEstimate?: FeeEstimate
}
