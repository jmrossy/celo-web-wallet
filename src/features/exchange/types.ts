import { NativeTokenId } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'

export interface ExchangeRate {
  rate: number
  lastUpdated: number
}

export interface ExchangeTokenParams {
  amountInWei: string
  fromTokenId: NativeTokenId
  toTokenId: NativeTokenId
  exchangeRate?: ExchangeRate
  feeEstimates?: FeeEstimate[]
}
