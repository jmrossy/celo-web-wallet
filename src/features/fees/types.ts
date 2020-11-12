import { Currency } from 'src/consts'

export interface GasPrice {
  value: string
  lastUpdated: number
}

export interface FeeEstimate {
  gasPrice: string
  gasLimit: string
  fee: string // in wei
  currency: Currency
}
