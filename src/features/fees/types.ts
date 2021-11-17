import { NativeTokenId } from '../../tokens'

export interface GasPrice {
  value: string
  lastUpdated: number
}

export interface FeeEstimate {
  gasPrice: string
  gasLimit: string
  fee: string // in wei
  token: NativeTokenId
}
