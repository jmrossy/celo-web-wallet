import { Token } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'

export interface ExchangeRate {
  rate: number
  lastUpdated: number
}

export interface ExchangeTokenParams {
  amountInWei: string
  fromToken: Token
  toToken: Token
  exchangeRate?: ExchangeRate
  feeEstimates?: FeeEstimate[]
}
