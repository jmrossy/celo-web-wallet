// Copied from https://github.com/WalletConnect/walletconnect-monorepo/blob/7aeb3fe5dd0ec6c8f52a5d19d1dc69246e0076be/packages/helpers/types/index.d.ts#L120
// Because importing types from the aliased wcv1/types package does not work

export interface ISessionStatus {
  chainId: number
  accounts: string[]
  networkId?: number
  rpcUrl?: string
}

export interface ISessionError {
  message?: string
}

export interface IInternalEvent {
  event: string
  params: any
}

export interface ICallTxData {
  type?: string
  to?: string
  value?: number | string
  gas?: number | string
  gasLimit?: number | string
  gasPrice?: number | string
  nonce?: number | string
  data?: string
}

export interface ITxData extends ICallTxData {
  from: string
}

export interface IJsonRpcResponseSuccess {
  id: number
  jsonrpc: string
  result: any
}

export interface IJsonRpcErrorMessage {
  code?: number
  message: string
}

export interface IJsonRpcResponseError {
  id: number
  jsonrpc: string
  error: IJsonRpcErrorMessage
}

export interface IJsonRpcRequest<T> {
  id: number
  jsonrpc: string
  method: string
  params: T[]
}

export interface IJsonRpcSubscription {
  id: number
  jsonrpc: string
  method: string
  params: any
}

export type JsonRpc =
  | IJsonRpcRequest<any>
  | IJsonRpcSubscription
  | IJsonRpcResponseSuccess
  | IJsonRpcResponseError

export type IErrorCallback = (err: Error | null, data?: any) => void

export type ICallback = () => void

export interface IError extends Error {
  res?: any
  code?: any
}

export interface IClientMeta {
  description: string
  url: string
  icons: string[]
  name: string
}

export interface ISessionParams {
  approved: boolean
  chainId: number | null
  networkId: number | null
  accounts: string[] | null
  rpcUrl?: string | null
  peerId?: string | null
  peerMeta?: IClientMeta | null
}

export interface IWalletConnectSession {
  connected: boolean
  accounts: string[]
  chainId: number
  bridge: string
  key: string
  clientId: string
  clientMeta: IClientMeta | null
  peerId: string
  peerMeta: IClientMeta | null
  handshakeId: number
  handshakeTopic: string
}
