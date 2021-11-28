import type { SessionTypes } from 'wcv2/types'

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

export enum WalletConnectMethods {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  sendTransaction = 'eth_sendTransaction',
  sign = 'eth_sign',
  signTypedData = 'eth_signTypedData',
  personalSign = 'personal_sign',
  personalDecrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}
