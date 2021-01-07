import { Currency } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'

export interface ExchangeRate {
  rate: number
  lastUpdated: number
}

export interface ExchangeTokenParams {
  amountInWei: string
  fromCurrency: Currency
  exchangeRate?: ExchangeRate
  feeEstimates?: FeeEstimate[]
}
