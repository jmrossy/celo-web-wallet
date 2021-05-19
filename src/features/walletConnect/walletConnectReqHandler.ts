import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import WalletConnectClient from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { ERROR as WcError, Error as WcErrorType } from '@walletconnect/utils'
import { utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { config } from 'src/config'
import { WalletConnectMethods } from 'src/features/walletConnect/types'
import { completeWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { call, put, select } from 'typed-redux-saga'

export async function validateRequestEvent(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient
) {
  if (!event) {
    logger.warn('Ignoring null WalletConnect request event')
    return false
  }

  if (event.chainId !== `celo:${config.chainId}`) {
    await denyRequest(event, client, WcError.UNSUPPORTED_CHAINS)
    return false
  }

  const requestMethod = event.request.method
  const supportedMethods = Object.values(WalletConnectMethods) as string[]
  if (!requestMethod || !supportedMethods.includes(requestMethod)) {
    await denyRequest(event, client, WcError.UNSUPPORTED_JSONRPC)
    return false
  }

  if (requestMethod === WalletConnectMethods.signTransaction) {
    const tx = event.request.params
    if (!isValidTx(tx)) {
      await denyRequest(event, client, WcError.MISSING_OR_INVALID)
      return false
    }
  } else if (requestMethod === WalletConnectMethods.personalSign) {
    const message = event.request.params
    if (!message) {
      await denyRequest(event, client, WcError.MISSING_OR_INVALID)
      return false
    }
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
    yield* put(completeWcRequest())
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
  } else if (method === WalletConnectMethods.personalSign) {
    yield* call(signMessage, event, client)
  } else if (method === WalletConnectMethods.sendTransaction) {
    // TODO
    yield* call(denyRequest, event, client, WcError.UNSUPPORTED_JSONRPC)
  } else if (method === WalletConnectMethods.signTransaction) {
    yield* call(signTransaction, event, client)
  } else if (method === WalletConnectMethods.signTypedData) {
    // TODO
    yield* call(denyRequest, event, client, WcError.UNSUPPORTED_JSONRPC)
  }

  yield* put(completeWcRequest())
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
  const result = await signer.signTransaction(formattedTx)
  return respond(event, client, result)
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
  return client.respond({
    topic: event.topic,
    response: {
      id: event.request.id,
      jsonrpc: event.request.jsonrpc,
      result: result ?? undefined,
      error: error ? error.format() : undefined,
    },
  })
}

function isValidTx(tx: CeloTransactionRequest & { gas?: BigNumberish }) {
  try {
    if (!tx) throw new Error('Tx missing')
    if (!tx.nonce || BigNumber.from(tx.nonce).lte(0)) throw new Error('Invalid nonce')
    if (!tx.to || !utils.isAddress(tx.to)) throw new Error('Invalid to field')
    if (!tx.from || !utils.isAddress(tx.from)) throw new Error('Invalid from field')
    if (tx.chainId !== config.chainId) throw new Error('Invald chain id')
    if (!tx.gas && !tx.gasLimit) throw new Error('Invald gas')
    if (!tx.gasPrice) throw new Error('Invald gas price')
    return true
  } catch (error) {
    logger.error('Error validating WalletConnect tx request', error, tx)
    return false
  }
}

// Ethers uses slightly different tx field names than web3 / celo sdk
function translateTxFields(tx: CeloTransactionRequest & { gas?: BigNumberish }) {
  if (tx.gasLimit && !tx.gas) {
    return tx
  } else if (tx.gas) {
    const { gas, ...rest } = tx
    return { ...rest, gasLimit: gas }
  } else throw new Error('Gas field missing')
}
