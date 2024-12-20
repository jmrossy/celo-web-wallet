import { EventChannel, eventChannel } from '@redux-saga/core'
import { call as rawCall } from '@redux-saga/core/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import type WalletKitType from '@reown/walletkit'
import { WalletKit, WalletKitTypes } from '@reown/walletkit'
import type CoreType from '@walletconnect/core'
import { Core } from '@walletconnect/core'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { appSelect } from 'src/app/appSelect'
import { config } from 'src/config'
import {
  APP_METADATA,
  SESSION_INIT_TIMEOUT,
  SESSION_REQUEST_TIMEOUT,
  SUPPORTED_CHAINS,
  SUPPORTED_METHODS,
} from 'src/features/walletConnect/config'
import {
  handleWalletConnectRequest,
  validateRequestEvent,
} from 'src/features/walletConnect/requestHandler'
import { WalletConnectError, WalletConnectSession } from 'src/features/walletConnect/types'
import {
  approveWcRequest,
  approveWcSession,
  createWcSession,
  deleteWcSession,
  disconnectWcClient,
  failWcRequest,
  failWcSession,
  proposeWcSession,
  rejectWcRequest,
  rejectWcSession,
  requestFromWc,
} from 'src/features/walletConnect/walletConnectSlice'
import 'src/polyfills/buffer' // Must be the first import
import { logger } from 'src/utils/logger'
import { withTimeout } from 'src/utils/timeout'
import { errorToString } from 'src/utils/validation'
import { call, cancelled, delay, fork, put, race, take } from 'typed-redux-saga'

let core: CoreType | undefined = undefined
let walletKit: WalletKitType | undefined = undefined

// This is what actually interacts with the WC client
// It initializes it, pairs it, and handles events
export function* runWalletConnectSession(uri: string) {
  // Initialize the client
  const { walletKit, channel } = yield* withTimeout(
    rawCall(initClient, uri),
    SESSION_INIT_TIMEOUT,
    'Client initialization timed out'
  )

  try {
    // Wait for a session proposal
    const proposal = yield* withTimeout(
      rawCall(waitForSessionProposal, channel),
      SESSION_INIT_TIMEOUT,
      'No session proposal received'
    )
    yield* fork(handleSessionProposal, proposal, walletKit)

    // Watch for events
    while (true) {
      const event = yield* take(channel)
      if (!event || !event.type) {
        logger.error(`Invalid WC event from channel: ${JSON.stringify(event)}`)
        continue
      }
      const { type, payload } = event
      logger.debug('Event from WalletConnect channel', type)
      if (type === deleteWcSession.type) {
        // throw new Error('DApp deleted session')
        logger.debug('DApp deleted session', type)
        break
      }
      if (type === proposeWcSession.type) {
        logger.warn('Ignoring new session proposal while one is active')
      }
      if (type === requestFromWc.type) {
        const requestEvent = payload as WalletKitTypes.SessionRequest
        yield* fork(handleRequestEvent, requestEvent, walletKit)
      }
    }
  } catch (error) {
    // Note, saga-quirk: errors from fork calls won't be caught here
    yield* put(failWcSession(errorToString(error)))
    logger.error('Error during WalletConnect V2 session', error)
  } finally {
    if (yield* cancelled()) {
      logger.debug('WalletConnect session cancelled before completion')
    }
    yield* call(closeClient, walletKit, channel)
  }
}

// Create a new client, set up a channel to observe it,
// and pair it with the target URI
async function initClient(uri: string) {
  logger.info('Initializing WalletConnect')

  if (!core || !walletKit) {
    // Create new client
    core = new Core({
      projectId: config.walletConnectV2ProjectId || undefined,
    })

    walletKit = await WalletKit.init({
      core,
      metadata: APP_METADATA,
    })
  }

  // Set up channel to watch for events
  const channel = createWalletConnectChannel(walletKit)
  await walletKit.pair({ uri })
  return { core, walletKit, channel }
}

// Creates a channel to observer for wc client events
// This is the typical way to connect events into saga-land
function createWalletConnectChannel(walletKit: WalletKitType) {
  return eventChannel<PayloadAction<any>>((emit) => {
    if (!walletKit) throw new Error('Cannot create WC channel without kit')

    const onSessionProposal = (session: WalletKitTypes.SessionProposal) =>
      emit(proposeWcSession(session))
    // const onSessionCreated = (session: WalletKitTypes.) => emit(createWcSession(session))
    // const onSessionUpdated = (session: WalletKitTypes.Event) => emit(updateWcSession(session))
    const onSessionDeleted = (session: { id: number; topic: string }) =>
      emit(deleteWcSession(session))
    const onSessionRequest = (request: WalletKitTypes.SessionRequest) =>
      emit(requestFromWc(request))
    // const onPairingProposal = (pairing: PairingTypes.ProposeParams) => handlePairingEvent(pairing)
    // const onPairingCreated = (pairing: PairingTypes.CreateParams) => handlePairingEvent(pairing)
    // const onPairingUpdated = (pairing: PairingTypes.UpdateParams) => handlePairingEvent(pairing)
    // const onPairingDeleted = (pairing: PairingTypes.DeleteParams) => handlePairingEvent(pairing)

    walletKit.on('session_proposal', onSessionProposal)
    // walletKit.on(CLIENT_EVENTS.session.created, onSessionCreated)
    // walletKit.on(CLIENT_EVENTS.session.updated, onSessionUpdated)
    walletKit.on('session_delete', onSessionDeleted)
    walletKit.on('session_request', onSessionRequest)
    // client.on(CLIENT_EVENTS.pairing.proposal, onPairingProposal)
    // client.on(CLIENT_EVENTS.pairing.created, onPairingCreated)
    // client.on(CLIENT_EVENTS.pairing.updated, onPairingUpdated)
    // client.on(CLIENT_EVENTS.pairing.deleted, onPairingDeleted)

    return () => {
      if (!walletKit) {
        logger.error('WC client already missing before channel cleanup')
        return
      }
      logger.debug('Cleaning up WC channel')
      walletKit.off('session_proposal', onSessionProposal)
      // client.off(CLIENT_EVENTS.session.created, onSessionCreated)
      // client.off(CLIENT_EVENTS.session.updated, onSessionUpdated)
      walletKit.off('session_delete', onSessionDeleted)
      walletKit.off('session_request', onSessionRequest)
      // client.off(CLIENT_EVENTS.pairing.proposal, onPairingProposal)
      // client.off(CLIENT_EVENTS.pairing.created, onPairingCreated)
      // client.off(CLIENT_EVENTS.pairing.updated, onPairingUpdated)
      // client.off(CLIENT_EVENTS.pairing.deleted, onPairingDeleted)
    }
  })
}

function* waitForSessionProposal(channel: EventChannel<PayloadAction<any>>) {
  while (true) {
    const event = yield* take(channel)
    if (event?.type === proposeWcSession.type) return event.payload
  }
}

// Handle a session proposal
// The user must review the details and approve/reject
function* handleSessionProposal(
  proposal: WalletKitTypes.SessionProposal,
  walletKit: WalletKitType
) {
  logger.debug('WalletConnect session proposed')

  yield* put(proposeWcSession(proposal))

  const isValid = yield* call(validateProposal, proposal)
  if (!isValid) {
    yield* put(failWcSession('Session proposal is invalid'))
    throw new Error('WalletConnect session proposal invalid')
  }

  const decision = yield* take([approveWcSession.type, rejectWcSession.type])
  if (decision.type == approveWcSession.type) {
    const address = yield* appSelect((s) => s.wallet.address)
    yield* call(approveClientSession, proposal, walletKit, address)
    logger.debug('WalletConnect session created')
    yield* put(createWcSession(proposal))
  } else {
    yield* call(rejectClientSession, proposal, walletKit, 'user denied')
    throw new Error('WalletConnect session proposal rejected')
  }
}

async function validateProposal(
  proposal: WalletKitTypes.SessionProposal
  // walletKit: WalletKitType
) {
  if (!proposal) {
    logger.warn('Rejecting WalletConnect session: no proposal')
    // await walletKit.rejectSession({ id: proposal.id, reason: getSdkError('USER_REJECTED_METHODS') })
    return false
  }

  // TODO restore and update for the latest WC lib shapes
  // const unsupportedChain = proposal.permissions.blockchain.chains.find(
  //   (chainId) => !SUPPORTED_CHAINS.includes(chainId)
  // )
  // if (unsupportedChain) {
  //   logger.warn(`Rejecting WalletConnect session: unsupported chain ${unsupportedChain}`)
  //   await client.reject({ proposal, reason: WcError.UNSUPPORTED_CHAINS.format() })
  //   return false
  // }

  // const supportedMethods = Object.values(WalletConnectMethod) as string[]
  // const unsupportedMethod = proposal.permissions.jsonrpc.methods.find(
  //   (method) => !supportedMethods.includes(method)
  // )
  // if (unsupportedMethod) {
  //   logger.warn(`Rejecting WalletConnect session: unsupported method ${unsupportedMethod}`)
  //   await client.reject({
  //     proposal,
  //     reason: WcError.UNSUPPORTED_JSONRPC.format(),
  //   })
  //   return false
  // }

  return true
}

function approveClientSession(
  proposal: WalletKitTypes.SessionProposal,
  walletKit: WalletKitType,
  account: string | null
) {
  logger.debug('Approving WalletConnect session proposal')

  if (!account) throw new Error('Cannot approve WC session before creating account')

  const approvedNamespaces = buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces: {
      eip155: {
        chains: SUPPORTED_CHAINS,
        methods: SUPPORTED_METHODS,
        events: ['accountsChanged', 'chainChanged'],
        accounts: [`eip155:${config.chainId}:${account}`],
      },
    },
  })

  return walletKit.approveSession({ id: proposal.id, namespaces: approvedNamespaces })
}

function rejectClientSession(
  proposal: WalletKitTypes.SessionProposal,
  walletKit: WalletKitType,
  reason: string
) {
  logger.warn(`Rejecting WalletConnect session: ${reason}`)
  return walletKit.rejectSession({
    id: proposal.id,
    reason: getSdkError('USER_REJECTED'),
  })
}

function* handleRequestEvent(event: WalletKitTypes.SessionRequest, walletKit: WalletKitType) {
  logger.debug('WalletConnect session request received')

  try {
    const isValid = yield* call(validateRequestEvent, event, walletKit, denyRequest)
    if (!isValid) return // silently reject invalid requests

    yield* put(requestFromWc(event))

    const { approve, timeout } = yield* race({
      approve: take(approveWcRequest.type),
      reject: take(rejectWcRequest.type),
      timeout: delay(SESSION_REQUEST_TIMEOUT),
    })

    yield* call(
      handleWalletConnectRequest,
      event,
      walletKit,
      !!approve,
      approveRequest,
      denyRequest
    )
    if (timeout) {
      yield* put(failWcRequest('Request timed out, please try again'))
    }
  } catch (error) {
    logger.error('Error handling request event', error)
    yield* put(failWcRequest(errorToString(error)))
  }
}

export function denyRequest(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  error: WalletConnectError
) {
  logger.debug('Denying WalletConnect request event', event.id, error)
  return respond(event, walletKit, undefined, error)
}

export function approveRequest(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  result: any
) {
  logger.debug('Approving WalletConnect request event', event.id)
  return respond(event, walletKit, result)
}

function respond(
  event: WalletKitTypes.SessionRequest,
  walletKit: WalletKitType,
  result?: any,
  error?: string
) {
  const base = {
    topic: event.topic,
    response: {
      id: event.id,
      jsonrpc: '2.0',
    },
  }
  let response
  if (result) {
    response = { ...base, response: { ...base.response, result } }
  } else if (error) {
    response = {
      ...base,
      response: {
        ...base.response,
        error: {
          code: 5000,
          message: error,
        },
      },
    }
  } else {
    throw new Error('Cannot respond without result or error')
  }
  return walletKit.respondSessionRequest(response)
}

function* closeClient(walletKit: WalletKitType, channel: EventChannel<PayloadAction<any>>) {
  logger.info('Closing WalletConnect client')
  if (!walletKit || !channel) {
    logger.error('Attempting to close WC client before properly initialized')
    return
  }
  // Close the event channel to clean it up
  channel.close()
  const session = yield* appSelect((state) => state.walletConnect.session)
  yield* call(disconnectClient, walletKit, session)
  yield* put(disconnectWcClient())
}

async function disconnectClient(walletKit: WalletKitType, session: WalletConnectSession | null) {
  logger.debug('Disconnecting WalletConnect Client')

  // Disconnect the active session if there is one
  if (session) {
    try {
      await walletKit.disconnectSession({
        topic: session.data.params.pairingTopic,
        reason: getSdkError('USER_DISCONNECTED'),
      })
    } catch (error) {
      logger.error('Error disconnecting WalletConnect client', error)
    }
  }

  logger.debug('WalletConnect client disconnected')
}
