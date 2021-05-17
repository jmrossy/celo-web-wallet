import {
  SessionType,
  WalletConnectMethods,
  WalletConnectSession,
} from 'src/features/walletConnect/types'
import { trimToLength } from 'src/utils/string'

export function getPeerName(session: WalletConnectSession | null, trim = false) {
  let name = 'Unknown DApp'
  if (session?.type === SessionType.Pending) name = session.data.proposer?.metadata?.name || name
  if (session?.type === SessionType.Settled) name = session.data.peer?.metadata?.name || name
  return trim ? trimToLength(name, 10) : name
}

export function getPeerUrl(session: WalletConnectSession | null) {
  if (session?.type === SessionType.Pending) return session.data.proposer?.metadata?.url
  if (session?.type === SessionType.Settled) return session.data.peer?.metadata?.url
  return null
}

export function getStartTime(session: WalletConnectSession | null) {
  if (session?.type === SessionType.Settled) return new Date(session.startTime).toLocaleString()
  return 'Not yet started'
}

export function getExpiryTime(session: WalletConnectSession | null) {
  let time
  if (session?.type === SessionType.Pending) time = session.data.ttl
  if (session?.type === SessionType.Settled) time = session.data.expiry
  return time ? new Date(time).toLocaleString() : 'Unknown time'
}

export function getPermissionList(session: WalletConnectSession | null) {
  const rpcMethods = session?.data?.permissions?.jsonrpc?.methods
  if (!rpcMethods || !Array.isArray(rpcMethods)) return 'Session permissions unknown'
  if (rpcMethods.length === 0) return 'No permissions requested'
  return rpcMethods.map(rpcMethodToLable).join(', ')
}

function rpcMethodToLable(method: string) {
  switch (method) {
    case WalletConnectMethods.accounts:
      return 'View accounts'
    case WalletConnectMethods.computeSharedSecret:
      return 'Compute secret'
    case WalletConnectMethods.decrypt:
      return 'Decrypt data'
    case WalletConnectMethods.personalSign:
      return 'Sign data'
    case WalletConnectMethods.sendTransaction:
      return 'Send transaction'
    case WalletConnectMethods.signTransaction:
      return 'Sign transaction'
    case WalletConnectMethods.signTypedData:
      return 'Sign typed data'
    default:
      return method
  }
}
