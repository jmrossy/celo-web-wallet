import { FeeEstimate } from 'src/features/fees/types'
import { NativeTokenId } from 'src/tokens'

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
