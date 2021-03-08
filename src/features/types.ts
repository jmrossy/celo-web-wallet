import { NativeTokenId, Token } from 'src/currency'
import { VoteValue } from 'src/features/governance/types'

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
  feeCurrency?: NativeTokenId
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
  OtherTokenTransfer,
  EscrowTransfer,
  EscrowWithdraw,
  TokenExchange,
  AccountRegistration,
  LockCelo,
  RelockCelo,
  UnlockCelo,
  WithdrawLockedCelo,
  ValidatorVoteCelo,
  ValidatorRevokeActiveCelo,
  ValidatorRevokePendingCelo,
  ValidatorActivateCelo,
  GovernanceVote,
  Other,
}

export interface StableTokenTransferTx extends Transaction {
  type: TransactionType.StableTokenTransfer
  comment?: string
  isOutgoing: boolean
  token: Token // TODO avoid putting full token data here to reduce storage?
}

export interface StableTokenApproveTx extends Transaction {
  type: TransactionType.StableTokenApprove
  approvedValue: string
  spender: string
  token: Token
}

export interface CeloTokenTransferTx extends Transaction {
  type: TransactionType.CeloTokenTransfer
  comment?: string
  isOutgoing: boolean
  token: Token
}

export interface CeloTokenApproveTx extends Transaction {
  type: TransactionType.CeloTokenApprove
  token: Token
  approvedValue: string
  spender: string
}

export interface CeloNativeTransferTx extends Transaction {
  type: TransactionType.CeloNativeTransfer
  isOutgoing: boolean
  comment: undefined
  token: Token
}

export interface OtherTokenTransfer extends Transaction {
  type: TransactionType.OtherTokenTransfer
  comment?: string
  isOutgoing: boolean
  token: Token
}

export interface EscrowTransferTx extends Transaction {
  type: TransactionType.EscrowTransfer
  isOutgoing: true
  token: Token
  comment?: string
}

export interface EscrowWithdrawTx extends Transaction {
  type: TransactionType.EscrowWithdraw
  token: Token
  isOutgoing: false
  comment?: string
}

export interface TokenExchangeTx extends Transaction {
  type: TransactionType.TokenExchange
  fromToken: Token
  toToken: Token
  fromValue: string
  toValue: string
}

export type LockTokenType =
  | TransactionType.LockCelo
  | TransactionType.RelockCelo
  | TransactionType.UnlockCelo
  | TransactionType.WithdrawLockedCelo
  | TransactionType.AccountRegistration

export interface LockTokenTx extends Transaction {
  type: LockTokenType
}

export type StakeTokenType =
  | TransactionType.ValidatorVoteCelo
  | TransactionType.ValidatorRevokeActiveCelo
  | TransactionType.ValidatorRevokePendingCelo
  | TransactionType.ValidatorActivateCelo

export interface StakeTokenTx extends Transaction {
  type: StakeTokenType
  groupAddress: string
}

export interface GovernanceVoteTx extends Transaction {
  type: TransactionType.GovernanceVote
  proposalId: string
  vote: VoteValue
}

export interface OtherTx extends Transaction {
  type: TransactionType.Other
}

export type TokenTransaction =
  | StableTokenTransferTx
  | CeloTokenTransferTx
  | StableTokenApproveTx
  | CeloTokenApproveTx
  | OtherTokenTransfer

export type EscrowTransaction = EscrowTransferTx | EscrowWithdrawTx

export type CeloTransaction =
  | TokenTransaction
  | CeloNativeTransferTx
  | TokenExchangeTx
  | EscrowTransaction
  | LockTokenTx
  | StakeTokenTx
  | GovernanceVoteTx
  | OtherTx

export type TokenTransfer =
  | StableTokenTransferTx
  | CeloTokenTransferTx
  | CeloNativeTransferTx
  | OtherTokenTransfer

export type TransactionMap = Record<string, CeloTransaction> // hash to item
