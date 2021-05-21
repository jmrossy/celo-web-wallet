import type { SessionTypes } from '@walletconnect/types'
import { FeeEstimate } from 'src/features/fees/types'

export interface WalletConnectUriForm {
  uri: string
}

export enum WalletConnectStatus {
  Error = -1,
  Disconnected = 0,
  Initializing = 1,
  SessionPending = 2,
  SessionActive = 3,
  RequestPending = 4,
  RequestActive = 5,
  RequestFailed = 6,
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
  personalSign = 'personal_sign',
  signTypedData = 'eth_signTypedData',
  personalDecrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}

export interface WalletConnectTxData {
  to: string
}

// export interface WalletConnectInitParams {
//   uri: string
// }

export interface WalletConnectRequestParams {
  //TODO
  data: WalletConnectTxData
  feeEstimate?: FeeEstimate
}
