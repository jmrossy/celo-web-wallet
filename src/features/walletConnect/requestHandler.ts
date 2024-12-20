import type WalletKitType from '@reown/walletkit'
import { WalletKitTypes } from '@reown/walletkit'
import { appSelect } from 'src/app/appSelect'
import { getSigner } from 'src/blockchain/signer'
import { sendSignedTransaction } from 'src/blockchain/transaction'
import { config } from 'src/config'
import { WalletConnectError, WalletConnectMethod } from 'src/features/walletConnect/types'
import { isValidTx, translateTxFields } from 'src/features/walletConnect/utils'
import { dismissWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { call, put } from 'typed-redux-saga'

export type ApproveHandler = (
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  result: any
) => Promise<void>

export type DenyHandler = (
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  reason: WalletConnectError
) => Promise<void>

export async function validateRequestEvent(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  denyRequest: DenyHandler
) {
  if (!event) {
    logger.warn('Ignoring null WalletConnect request event')
    return false
  }

  if (
    event.params.chainId !== `celo:${config.chainId}` &&
    event.params.chainId !== `eip155:${config.chainId}`
  ) {
    await denyRequest(event, walletKit, WalletConnectError.unsupportedChains)
    return false
  }

  const requestMethod = event.params.request.method
  const supportedMethods = Object.values(WalletConnectMethod) as string[]
  if (!requestMethod || !supportedMethods.includes(requestMethod)) {
    await denyRequest(event, walletKit, WalletConnectError.unsupportedJsonRpc)
    return false
  }

  if (
    requestMethod === WalletConnectMethod.signTransaction ||
    requestMethod === WalletConnectMethod.sendTransaction
  ) {
    // TODO support multiple txs here
    const tx = event.params.request.params[0]
    if (!isValidTx(tx)) {
      await denyRequest(event, walletKit, WalletConnectError.missingOrInvalid)
      return false
    }
  } else if (
    requestMethod === WalletConnectMethod.sign ||
    requestMethod === WalletConnectMethod.personalSign
  ) {
    // TODO support multiple txs here
    const message = event.params.request.params[0]
    if (!message) {
      await denyRequest(event, walletKit, WalletConnectError.missingOrInvalid)
      return false
    }
  } else {
    await denyRequest(event, walletKit, WalletConnectError.unsupportedJsonRpc)
    return false
  }

  return true
}

export function* handleWalletConnectRequest(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  approved: boolean,
  approveRequest: ApproveHandler,
  denyRequest: DenyHandler
) {
  logger.debug('WalletConnect action request received')

  if (!approved) {
    yield* call(denyRequest, event, walletKit, WalletConnectError.notApproved)
    yield* put(dismissWcRequest())
    return
  }

  const method = event.params.request.method
  if (method === WalletConnectMethod.accounts) {
    yield* call(getAccounts, event, walletKit, approveRequest)
  } else if (method === WalletConnectMethod.computeSharedSecret) {
    // TODO implement
    yield* call(denyRequest, event, walletKit, WalletConnectError.unsupportedJsonRpc)
  } else if (method === WalletConnectMethod.personalDecrypt) {
    // TODO implement
    yield* call(denyRequest, event, walletKit, WalletConnectError.unsupportedJsonRpc)
  } else if (method === WalletConnectMethod.sign || method === WalletConnectMethod.personalSign) {
    yield* call(signMessage, event, walletKit, approveRequest)
  } else if (method === WalletConnectMethod.sendTransaction) {
    yield* call(signAndSendTransaction, event, walletKit, approveRequest)
  } else if (method === WalletConnectMethod.signTransaction) {
    yield* call(signTransaction, event, walletKit, approveRequest)
  } else if (method === WalletConnectMethod.signTypedData) {
    // TODO implement
    yield* call(denyRequest, event, walletKit, WalletConnectError.unsupportedJsonRpc)
  }

  // Disabled complete state and then delay because it causes requests to be missed
  // when they come in during the delay. This means users don't see checkmark.
  // TODO find a better solution
  // yield* put(completeWcRequest())
  // yield* delay(DELAY_BEFORE_DISMISS)
  yield* put(dismissWcRequest())
}

function* getAccounts(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  approveRequest: ApproveHandler
) {
  logger.debug('Responding accounts for WalletConnect request')
  const address = yield* appSelect((s) => s.wallet.address)
  return approveRequest(event, walletKit, [address])
}

async function signTransaction(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  approveRequest: ApproveHandler
) {
  logger.debug('WalletConnect request: sign transaction')
  // TODO support multiple txs here
  const tx = event.params.request.params[0]
  const formattedTx = translateTxFields(tx)
  // TODO support other fee currencies,
  const signer = getSigner().signer
  const signedTx = await signer.signTransaction(formattedTx)
  const result = {
    tx,
    raw: signedTx,
  }
  return approveRequest(event, walletKit, result)
}

async function signAndSendTransaction(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  approveRequest: ApproveHandler
) {
  logger.debug('WalletConnect request: sign and send transaction')
  // TODO support multiple txs here
  const tx = event.params.request.params[0]
  const formattedTx = translateTxFields(tx)
  // TODO support other fee currencies
  const signer = getSigner().signer
  const signedTx = await signer.signTransaction(formattedTx)
  const txReceipt = await sendSignedTransaction(signedTx)
  return approveRequest(event, walletKit, txReceipt.transactionHash)
}

async function signMessage(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  approveRequest: ApproveHandler
) {
  logger.debug('WalletConnect request: send message')
  const signer = getSigner().signer
  // TODO support multiple txs here
  const message = event.params.request.params[0]
  const result = await signer.signMessage(message)
  return approveRequest(event, walletKit, result)
}
