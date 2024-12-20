import { type WalletKitTypes } from '@reown/walletkit'

export interface WalletConnectUriForm {
  uri: string
}

export enum WalletConnectStatus {
  Disconnected,
  Initializing,
  SessionPending,
  SessionActive,
  RequestPending,
  RequestActive,
  RequestComplete,
  RequestFailed,
  Error,
}

export enum SessionStatus {
  Pending,
  Settled,
}

export interface PendingSession {
  status: SessionStatus.Pending
  data: WalletKitTypes.SessionProposal
}

export interface SettledSession {
  status: SessionStatus.Settled
  data: WalletKitTypes.SessionProposal
  startTime: number
}

export type WalletConnectSession = PendingSession | SettledSession

export enum WalletConnectMethod {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  sendTransaction = 'eth_sendTransaction',
  sign = 'eth_sign',
  signTypedData = 'eth_signTypedData',
  personalSign = 'personal_sign',
  personalDecrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}

export enum WalletConnectError {
  unsupportedJsonRpc = 'unsupported_json_rpc',
  unsupportedChains = 'unsupported_chains',
  missingOrInvalid = 'missing_or_invalid',
  notApproved = 'not_approved',
}
