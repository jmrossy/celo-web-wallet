import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumberish } from 'ethers'
import { getContractName } from 'src/blockchain/contracts'
import {
  SessionStatus,
  WalletConnectMethods,
  WalletConnectSession,
  WalletConnectUriForm,
} from 'src/features/walletConnect/types'
import { findTokenByAddress } from 'src/tokenList'
import { CELO, NativeTokens, UnknownToken } from 'src/tokens'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { trimToLength } from 'src/utils/string'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function validateWalletConnectForm(values: WalletConnectUriForm): ErrorState {
  const { uri } = values
  if (!uri || !uri.length) {
    return invalidInput('uri', 'URI is required')
  }
  if (uri.length < 30 || !uri.startsWith('wc:')) {
    return invalidInput('uri', 'Invalid WalletConnect URI')
  }
  return { isValid: true }
}

export function getPeerName(session: WalletConnectSession | null, trim = false) {
  let name = 'Unknown DApp'
  if (session?.status === SessionStatus.Pending)
    name = session.data.proposer?.metadata?.name || name
  if (session?.status === SessionStatus.Settled) name = session.data.peer?.metadata?.name || name
  return trim ? trimToLength(name, 10) : name
}

export function getPeerUrl(session: WalletConnectSession | null) {
  if (session?.status === SessionStatus.Pending) return session.data.proposer?.metadata?.url
  if (session?.status === SessionStatus.Settled) return session.data.peer?.metadata?.url
  return null
}

export function getStartTime(session: WalletConnectSession | null) {
  if (session?.status === SessionStatus.Settled) return new Date(session.startTime).toLocaleString()
  return 'Not yet started'
}

export function getExpiryTime(session: WalletConnectSession | null) {
  let time
  if (session?.status === SessionStatus.Pending) time = session.data.ttl
  if (session?.status === SessionStatus.Settled) time = session.data.expiry
  return time ? new Date(time * 1000).toLocaleString() : 'Unknown time'
}

export function getPermissionList(session: WalletConnectSession | null) {
  const rpcMethods = session?.data?.permissions?.jsonrpc?.methods
  if (!rpcMethods || !Array.isArray(rpcMethods)) return 'Session permissions unknown'
  if (rpcMethods.length === 0) return 'No permissions requested'
  return rpcMethods.map(rpcMethodToLabel).join(', ')
}

export function rpcMethodToLabel(method: string) {
  switch (method) {
    case WalletConnectMethods.accounts:
      return 'view accounts'
    case WalletConnectMethods.computeSharedSecret:
      return 'compute secrets'
    case WalletConnectMethods.personalDecrypt:
      return 'decrypt data'
    case WalletConnectMethods.personalSign:
    case WalletConnectMethods.sign:
      return 'sign data'
    case WalletConnectMethods.sendTransaction:
      return 'send a transaction'
    case WalletConnectMethods.signTransaction:
      return 'sign a transaction'
    case WalletConnectMethods.signTypedData:
      return 'sign typed data'
    default:
      logger.warn('Unknown walletconnect rpc method', method)
      return method
  }
}

// Search through all known addresses to identify a contract
// TODO expand list via sourcify or other repos of contract info
export function identifyContractByAddress(address: string) {
  // Check if it's a known core contract
  const coreContractName = getContractName(address)
  if (coreContractName) return coreContractName

  // Check if it's a known token
  const token = findTokenByAddress(address)
  if (token) return token.name

  return null
}

export function identifyFeeToken(feeCurrency: string | null | undefined) {
  if (!feeCurrency) return CELO
  return (
    Object.values(NativeTokens).find((t) => areAddressesEqual(t.address, feeCurrency)) ||
    UnknownToken
  )
}

// Ethers uses slightly different tx field names than web3 / celo sdk
export function translateTxFields(tx: CeloTransactionRequest & { gas?: BigNumberish }) {
  if (tx.gasLimit && !tx.gas) {
    return tx
  } else if (tx.gas) {
    const { gas, ...rest } = tx
    return { ...rest, gasLimit: gas }
  } else throw new Error('Gas field missing in tx fields')
}
