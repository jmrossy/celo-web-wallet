import { FeeEstimate } from 'src/features/fees/types'
import { NativeTokenId } from 'src/tokens'

export type ToCeloRates = Record<string, ExchangeRate> // token id to token<->CELO rate

// Raw Mento chain data from an Exchange contract
export interface ExchangeRate {
  stableBucket: string
  celoBucket: string
  spread: string
  lastUpdated: number
}

// Result after ExchangeRate gets processed
export interface SimpleExchangeRate {
  rate: number
  lastUpdated: number
}

export interface ExchangeTokenParams {
  amountInWei: string
  fromTokenId: NativeTokenId
  toTokenId: NativeTokenId
  exchangeRate?: SimpleExchangeRate
  feeEstimates?: FeeEstimate[]
}
