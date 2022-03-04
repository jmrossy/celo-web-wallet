import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber, BigNumberish } from 'ethers'
import { getContractName } from 'src/blockchain/contracts'
import { config } from 'src/config'
import { MIN_GAS_AMOUNT } from 'src/consts'
import { findTokenByAddress } from 'src/features/tokens/tokenList'
import {
  SessionStatus,
  WalletConnectMethod,
  WalletConnectSession,
  WalletConnectUriForm,
  WalletConnectVersion,
} from 'src/features/walletConnect/types'
import { isValidAddress } from 'src/utils/addresses'
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

export function getWalletConnectVersion(uri: string): WalletConnectVersion | null {
  if (/^wc:[a-z0-9-].*@1/.test(uri)) return 1
  else if (/^wc:[a-z0-9].*@2/.test(uri)) return 2
  else return null
}

export function clearWalletConnectStorage() {
  try {
    if (!localStorage) throw new Error('LocalStorage inaccessible')
    for (const key of Object.keys(localStorage)) {
      if (/^walletconnect.*/.test(key) || /^wc.*/.test(key)) {
        localStorage.removeItem(key)
      }
    }
  } catch (error) {
    logger.warn('Error when clearing WalletConnect storage', error)
  }
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
    case WalletConnectMethod.accounts:
      return 'view accounts'
    case WalletConnectMethod.computeSharedSecret:
      return 'compute secrets'
    case WalletConnectMethod.personalDecrypt:
      return 'decrypt data'
    case WalletConnectMethod.personalSign:
    case WalletConnectMethod.sign:
      return 'sign data'
    case WalletConnectMethod.sendTransaction:
      return 'send a transaction'
    case WalletConnectMethod.signTransaction:
      return 'sign a transaction'
    case WalletConnectMethod.signTypedData:
      return 'sign typed data'
    default:
      logger.warn('Unknown walletconnect rpc method', method)
      return method
  }
}

// Search through all known addresses to identify a contract
// TODO expand list via sourcify or other repos of contract info
export function identifyContractByAddress(address: Address) {
  // Check if it's a known core contract
  const coreContractName = getContractName(address)
  if (coreContractName) return coreContractName

  // Check if it's a known token
  const token = findTokenByAddress(address)
  if (token) return token.name

  return null
}

// Ethers uses slightly different tx field names than web3 / celo sdk
export function translateTxFields(tx: CeloTransactionRequest & { gas?: BigNumberish }) {
  if (tx.gasLimit && !tx.gas) {
    return tx
  } else if (tx.gas) {
    const { gas, ...rest } = tx
    return { ...rest, gasLimit: gas }
  } else {
    logger.debug('No gas field found in WalletConnect tx')
    return tx
  }
}

export function isValidTx(tx: CeloTransactionRequest & { gas?: BigNumberish }) {
  try {
    if (!tx) throw new Error('Tx missing')
    if (!tx.to || !isValidAddress(tx.to)) throw new Error('Invalid to field')
    if (!tx.from || !isValidAddress(tx.from)) throw new Error('Invalid from field')
    if (tx.chainId && tx.chainId !== config.chainId) throw new Error('Invalid chain id')
    if (tx.nonce && BigNumber.from(tx.nonce).lte(0)) throw new Error('Invalid nonce')
    if (tx.gas && BigNumber.from(tx.gas).lte(MIN_GAS_AMOUNT)) throw new Error('Invalid gas')
    if (tx.gasLimit && BigNumber.from(tx.gasLimit).lte(MIN_GAS_AMOUNT))
      throw new Error('Invalid gasLimit')
    if (tx.gasPrice && BigNumber.from(tx.gasPrice).lte(0)) throw new Error('Invalid gas price')
    return true
  } catch (error) {
    logger.error('Error validating WalletConnect tx request', error, tx)
    return false
  }
}
