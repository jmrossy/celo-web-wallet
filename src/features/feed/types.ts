import { Currency } from 'src/consts'

interface Transaction {
  type: TransactionType
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number
  timestamp: number
  gasPrice: string
  gasUsed: string
  feeToken?: string
  gatewayFee?: string
  gatewayFeeRecipient?: string
}

export enum TransactionType {
  StableTokenTransfer,
  CeloTokenTransfer,
  CeloNativeTransfer,
  TokenExchange,
  Other,
}

export interface StableTokenTransferTx extends Transaction {
  type: TransactionType.StableTokenTransfer
  comment?: string
  isOutgoing: boolean
  currency: Currency.cUSD
}

export interface CeloTokenTransferTx extends Transaction {
  type: TransactionType.CeloTokenTransfer
  comment?: string
  isOutgoing: boolean
  currency: Currency.CELO
}

export interface CeloNativeTransferTx extends Transaction {
  type: TransactionType.CeloNativeTransfer
  isOutgoing: boolean
  comment: undefined
  currency: Currency.CELO
}

export interface TokenExchangeTx extends Transaction {
  type: TransactionType.TokenExchange
  fromToken: Currency
  toToken: Currency
  fromValue: string
  toValue: string
}

export interface OtherTx extends Transaction {
  type: TransactionType.Other
}

export type CeloTransaction =
  | StableTokenTransferTx
  | CeloTokenTransferTx
  | CeloNativeTransferTx
  | TokenExchangeTx
  | OtherTx

export type TokenTransfer = StableTokenTransferTx | CeloTokenTransferTx | CeloNativeTransferTx

export type TransactionMap = Record<string, CeloTransaction> // hash to item
