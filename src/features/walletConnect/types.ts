import type { SessionTypes } from 'wcv2/types'

export type WalletConnectVersion = 1 | 2

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
  data: SessionTypes.Proposal
}

export interface SettledSession {
  status: SessionStatus.Settled
  data: SessionTypes.Settled
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

// This is mostly a dupe of errors in the WCv2 error enum
// But using a custom subset to avoid bundle issues
export enum WalletConnectError {
  unsupportedJsonRpc = 'unsupported_json_rpc',
  unsupportedChains = 'unsupported_chains',
  missingOrInvalid = 'missing_or_invalid',
  notApproved = 'not_approved',
}
