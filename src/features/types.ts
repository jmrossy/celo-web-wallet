import { Currency } from 'src/consts'

interface Transaction {
  type: TransactionType
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number
  nonce: number
  timestamp: number
  gasPrice: string
  gasUsed: string
  feeCurrency?: Currency
  gatewayFee?: string
  gatewayFeeRecipient?: string
}

export enum TransactionType {
  StableTokenTransfer,
  StableTokenTransferWithComment,
  StableTokenApprove,
  CeloTokenTransfer,
  CeloTokenTransferWithComment,
  CeloTokenApprove,
  CeloNativeTransfer,
  EscrowTransfer,
  EscrowWithdraw,
  TokenExchange,
  Other,
}

export interface StableTokenTransferTx extends Transaction {
  type: TransactionType.StableTokenTransfer
  comment?: string
  isOutgoing: boolean
  currency: Currency.cUSD
}

export interface StableTokenApproveTx extends Transaction {
  type: TransactionType.StableTokenApprove
  currency: Currency.cUSD
  approvedValue: string
  spender: string
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

export interface EscrowTransferTx extends Transaction {
  type: TransactionType.EscrowTransfer
  isOutgoing: true
  currency: Currency
  comment?: string
}

export interface EscrowWithdrawTx extends Transaction {
  type: TransactionType.EscrowWithdraw
  currency: Currency
  isOutgoing: false
  comment?: string
}

export interface CeloTokenApproveTx extends Transaction {
  type: TransactionType.CeloTokenApprove
  currency: Currency.CELO
  approvedValue: string
  spender: string
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

export type TokenTransaction =
  | StableTokenTransferTx
  | CeloTokenTransferTx
  | StableTokenApproveTx
  | CeloTokenApproveTx

export type EscrowTransaction = EscrowTransferTx | EscrowWithdrawTx

export type CeloTransaction =
  | TokenTransaction
  | CeloNativeTransferTx
  | TokenExchangeTx
  | EscrowTransaction
  | OtherTx

export type TokenTransfer = StableTokenTransferTx | CeloTokenTransferTx | CeloNativeTransferTx

export type TransactionMap = Record<string, CeloTransaction> // hash to item
