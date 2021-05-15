import { SessionTypes } from '@walletconnect/types'
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
}

export enum SessionType {
  Pending,
  Settled,
}

export interface PendingSession {
  type: SessionType.Pending
  data: SessionTypes.Proposal
}

export interface SettledSession {
  type: SessionType.Settled
  data: SessionTypes.Settled
}

export type WalletConnectSession = PendingSession | SettledSession

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
