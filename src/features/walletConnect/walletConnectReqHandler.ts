import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import WalletConnectClient from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { ERROR as WcError, Error as WcErrorType } from '@walletconnect/utils'
import { BigNumber, BigNumberish } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { sendSignedTransaction } from 'src/blockchain/transaction'
import { config } from 'src/config'
import { WalletConnectMethods } from 'src/features/walletConnect/types'
import { translateTxFields } from 'src/features/walletConnect/utils'
import { completeWcRequest, dismissWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { isValidAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { call, delay, put, select } from 'typed-redux-saga'

const DELAY_BEFORE_DISSMISS = 2500 // 2.5 seconds

export async function validateRequestEvent(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient
) {
  if (!event) {
    logger.warn('Ignoring null WalletConnect request event')
    return false
  }

  if (event.chainId !== `celo:${config.chainId}` && event.chainId !== `eip155:${config.chainId}`) {
    await denyRequest(event, client, WcError.UNSUPPORTED_CHAINS)
    return false
  }

  const requestMethod = event.request.method
  const supportedMethods = Object.values(WalletConnectMethods) as string[]
  if (!requestMethod || !supportedMethods.includes(requestMethod)) {
    await denyRequest(event, client, WcError.UNSUPPORTED_JSONRPC)
    return false
  }

  if (
    requestMethod === WalletConnectMethods.signTransaction ||
    requestMethod === WalletConnectMethods.sendTransaction
  ) {
    const tx = event.request.params
    if (!isValidTx(tx)) {
      await denyRequest(event, client, WcError.MISSING_OR_INVALID)
      return false
    }
  } else if (
    requestMethod === WalletConnectMethods.sign ||
    requestMethod === WalletConnectMethods.personalSign
  ) {
    const message = event.request.params
    if (!message) {
      await denyRequest(event, client, WcError.MISSING_OR_INVALID)
      return false
    }
  } else {
    await denyRequest(event, client, WcError.UNSUPPORTED_JSONRPC)
    return false
  }

  return true
}

export function* handleWalletConnectRequest(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  approved: boolean
) {
  logger.debug('WalletConnect action request received')

  if (!approved) {
    yield* call(denyRequest, event, client, WcError.NOT_APPROVED)
    yield* put(dismissWcRequest())
    return
  }

  const method = event.request.method
  if (method === WalletConnectMethods.accounts) {
    yield* call(getAccounts, event, client)
  } else if (method === WalletConnectMethods.computeSharedSecret) {
    // TODO
    yield* call(denyRequest, event, client, WcError.UNSUPPORTED_JSONRPC)
  } else if (method === WalletConnectMethods.personalDecrypt) {
    // TODO
    yield* call(denyRequest, event, client, WcError.UNSUPPORTED_JSONRPC)
  } else if (method === WalletConnectMethods.sign || method === WalletConnectMethods.personalSign) {
    yield* call(signMessage, event, client)
  } else if (method === WalletConnectMethods.sendTransaction) {
    yield* call(signAndSendTransaction, event, client)
  } else if (method === WalletConnectMethods.signTransaction) {
    yield* call(signTransaction, event, client)
  } else if (method === WalletConnectMethods.signTypedData) {
    // TODO
    yield* call(denyRequest, event, client, WcError.UNSUPPORTED_JSONRPC)
  }

  yield* put(completeWcRequest())
  yield* delay(DELAY_BEFORE_DISSMISS)
  yield* put(dismissWcRequest())
}

function denyRequest(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  error: WcErrorType
) {
  logger.debug('Denying WalletConnect request event', event.request.method, error)
  return respond(event, client, undefined, error)
}

function* getAccounts(event: SessionTypes.RequestEvent, client: WalletConnectClient) {
  logger.debug('Responding accounts for WalletConnect request')
  const address = yield* select((s: RootState) => s.wallet.address)
  return respond(event, client, [address])
}

async function signTransaction(event: SessionTypes.RequestEvent, client: WalletConnectClient) {
  logger.debug('WalletConnect request: sign transaction')

  const tx = event.request.params
  const formattedTx = translateTxFields(tx)
  const signer = getSigner().signer
  const signedTx = await signer.signTransaction(formattedTx)
  const result = {
    tx,
    raw: signedTx,
  }
  return respond(event, client, result)
}

// TODO: This assumes the request has a fully formed tx
// It would be useful to have the wallet handle gas concerns
// So the DApp can just worry about the data
async function signAndSendTransaction(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient
) {
  logger.debug('WalletConnect request: send transaction')

  const tx = event.request.params
  const formattedTx = translateTxFields(tx)
  const signer = getSigner().signer
  const signedTx = await signer.signTransaction(formattedTx)
  const txReceipt = await sendSignedTransaction(signedTx)
  return respond(event, client, txReceipt.transactionHash)
}

async function signMessage(event: SessionTypes.RequestEvent, client: WalletConnectClient) {
  const signer = getSigner().signer
  const message = event.request.params
  const result = await signer.signMessage(message)
  return respond(event, client, result)
}

function respond(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  result?: any,
  error?: WcErrorType
) {
  logger.debug('Responding to WalletConnect client')
  const base = {
    topic: event.topic,
    response: {
      id: event.request.id,
      jsonrpc: event.request.jsonrpc,
    },
  }
  let response
  if (result) {
    response = { ...base, response: { ...base.response, result } }
  } else if (error) {
    response = { ...base, response: { ...base.response, error: error.format() } }
  } else {
    throw new Error('Cannot respond without result or error')
  }
  return client.respond(response)
}

function isValidTx(tx: CeloTransactionRequest & { gas?: BigNumberish }) {
  try {
    if (!tx) throw new Error('Tx missing')
    if (!tx.nonce || BigNumber.from(tx.nonce).lte(0)) throw new Error('Invalid nonce')
    if (!tx.to || !isValidAddress(tx.to)) throw new Error('Invalid to field')
    if (!tx.from || !isValidAddress(tx.from)) throw new Error('Invalid from field')
    if (tx.chainId !== config.chainId) throw new Error('Invald chain id')
    if (!tx.gas && !tx.gasLimit) throw new Error('Invald gas')
    if (!tx.gasPrice) throw new Error('Invald gas price')
    return true
  } catch (error) {
    logger.error('Error validating WalletConnect tx request', error, tx)
    return false
  }
}
