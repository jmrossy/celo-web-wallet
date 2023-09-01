import { appSelect } from 'src/app/appSelect'
import { getSigner } from 'src/blockchain/signer'
import { sendSignedTransaction } from 'src/blockchain/transaction'
import { config } from 'src/config'
import { DELAY_BEFORE_DISMISS } from 'src/features/walletConnect/config'
import { WalletConnectError, WalletConnectMethod } from 'src/features/walletConnect/types'
import { isValidTx, translateTxFields } from 'src/features/walletConnect/utils'
import { completeWcRequest, dismissWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { call, delay, put } from 'typed-redux-saga'

export type ApproveHandler = (event: any, client: any, result: any) => Promise<void>

export type DenyHandler = (event: any, client: any, reason: WalletConnectError) => Promise<void>

export async function validateRequestEvent(event: any, client: any, denyRequest: DenyHandler) {
  if (!event) {
    logger.warn('Ignoring null WalletConnect request event')
    return false
  }

  if (event.chainId !== `celo:${config.chainId}` && event.chainId !== `eip155:${config.chainId}`) {
    await denyRequest(event, client, WalletConnectError.unsupportedChains)
    return false
  }

  const requestMethod = event.request.method
  const supportedMethods = Object.values(WalletConnectMethod) as string[]
  if (!requestMethod || !supportedMethods.includes(requestMethod)) {
    await denyRequest(event, client, WalletConnectError.unsupportedJsonRpc)
    return false
  }

  if (
    requestMethod === WalletConnectMethod.signTransaction ||
    requestMethod === WalletConnectMethod.sendTransaction
  ) {
    const tx = event.request.params
    if (!isValidTx(tx)) {
      await denyRequest(event, client, WalletConnectError.missingOrInvalid)
      return false
    }
  } else if (
    requestMethod === WalletConnectMethod.sign ||
    requestMethod === WalletConnectMethod.personalSign
  ) {
    const message = event.request.params
    if (!message) {
      await denyRequest(event, client, WalletConnectError.missingOrInvalid)
      return false
    }
  } else {
    await denyRequest(event, client, WalletConnectError.unsupportedJsonRpc)
    return false
  }

  return true
}

export function* handleWalletConnectRequest(
  event: any,
  client: any,
  approved: boolean,
  approveRequest: ApproveHandler,
  denyRequest: DenyHandler
) {
  logger.debug('WalletConnect action request received')

  if (!approved) {
    yield* call(denyRequest, event, client, WalletConnectError.notApproved)
    yield* put(dismissWcRequest())
    return
  }

  const method = event.request.method
  if (method === WalletConnectMethod.accounts) {
    yield* call(getAccounts, event, client, approveRequest)
  } else if (method === WalletConnectMethod.computeSharedSecret) {
    // TODO implement
    yield* call(denyRequest, event, client, WalletConnectError.unsupportedJsonRpc)
  } else if (method === WalletConnectMethod.personalDecrypt) {
    // TODO implement
    yield* call(denyRequest, event, client, WalletConnectError.unsupportedJsonRpc)
  } else if (method === WalletConnectMethod.sign || method === WalletConnectMethod.personalSign) {
    yield* call(signMessage, event, client, approveRequest)
  } else if (method === WalletConnectMethod.sendTransaction) {
    yield* call(signAndSendTransaction, event, client, approveRequest)
  } else if (method === WalletConnectMethod.signTransaction) {
    yield* call(signTransaction, event, client, approveRequest)
  } else if (method === WalletConnectMethod.signTypedData) {
    // TODO implement
    yield* call(denyRequest, event, client, WalletConnectError.unsupportedJsonRpc)
  }

  yield* put(completeWcRequest())
  yield* delay(DELAY_BEFORE_DISMISS)
  yield* put(dismissWcRequest())
}

function* getAccounts(event: any, client: any, approveRequest: ApproveHandler) {
  logger.debug('Responding accounts for WalletConnect request')
  const address = yield* appSelect((s) => s.wallet.address)
  return approveRequest(event, client, [address])
}

async function signTransaction(event: any, client: any, approveRequest: ApproveHandler) {
  logger.debug('WalletConnect request: sign transaction')
  const tx = event.request.params
  const formattedTx = translateTxFields(tx)
  // TODO support other fee currencies,
  const signer = getSigner().signer
  const signedTx = await signer.signTransaction(formattedTx)
  const result = {
    tx,
    raw: signedTx,
  }
  return approveRequest(event, client, result)
}

async function signAndSendTransaction(event: any, client: any, approveRequest: ApproveHandler) {
  logger.debug('WalletConnect request: sign and send transaction')
  const tx = event.request.params
  const formattedTx = translateTxFields(tx)
  // TODO support other fee currencies
  const signer = getSigner().signer
  const signedTx = await signer.signTransaction(formattedTx)
  const txReceipt = await sendSignedTransaction(signedTx)
  return approveRequest(event, client, txReceipt.transactionHash)
}

async function signMessage(event: any, client: any, approveRequest: ApproveHandler) {
  logger.debug('WalletConnect request: send message')
  const signer = getSigner().signer
  const message = event.request.params
  const result = await signer.signMessage(message)
  return approveRequest(event, client, result)
}
