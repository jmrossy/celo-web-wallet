import { EventChannel, eventChannel } from '@redux-saga/core'
import { call as rawCall } from '@redux-saga/core/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from 'src/app/rootReducer'
import { config } from 'src/config'
import {
  APP_METADATA,
  SESSION_INIT_TIMEOUT,
  SESSION_PROPOSAL_TIMEOUT,
  SESSION_REQUEST_TIMEOUT,
  SUPPORTED_CHAINS,
} from 'src/features/walletConnect/config'
import {
  handleWalletConnectRequest,
  validateRequestEvent,
} from 'src/features/walletConnect/requestHandler'
import {
  SessionStatus,
  WalletConnectError,
  WalletConnectMethod,
  WalletConnectSession,
} from 'src/features/walletConnect/types'
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
  updateWcSession,
} from 'src/features/walletConnect/walletConnectSlice'
import 'src/polyfills/buffer' // Should be the first import
import { logger } from 'src/utils/logger'
import { withTimeout } from 'src/utils/timeout'
import { errorToString } from 'src/utils/validation'
import { call, cancelled, delay, fork, put, race, select, take } from 'typed-redux-saga'
import WalletConnectClient, { CLIENT_EVENTS } from 'wcv2/client'
import type { ClientTypes, SessionTypes } from 'wcv2/types'
import { ERROR as WcError, Error as WcErrorType } from 'wcv2/utils'

// This is what actually interacts with the WC client
// It initializes it, pairs it, and handles events
export function* runWalletConnectSession(uri: string) {
  // Initialize the client
  const { client, channel } = yield* withTimeout(
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
    yield* fork(handleSessionProposal, proposal, client)

    // Wait for a session creation
    const session = yield* withTimeout(
      rawCall(waitForSessionCreated, channel),
      SESSION_PROPOSAL_TIMEOUT,
      'Creating new session timed out'
    )
    yield* call(handleSessionCreated, session)

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
        throw new Error('DApp deleted session')
      }
      if (type === proposeWcSession.type) {
        logger.warn('Ignoring new session proposal while one is active')
      }
      if (type === requestFromWc.type) {
        const requestEvent = payload as SessionTypes.RequestEvent // Event channels loses type
        yield* fork(handleRequestEvent, requestEvent, client)
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
    yield* call(closeClient, client, channel)
  }
}

// Create a new client, set up a channel to observe it,
// and pair it with the target URI
async function initClient(uri: string) {
  logger.info('Initializing WalletConnect')
  // Create new client
  const client = await WalletConnectClient.init({
    relayProvider: config.walletConnectV2Relay,
    metadata: APP_METADATA,
    controller: true,
    logger: 'debug',
  })
  // Set up channel to watch for events
  const channel = createWalletConnectChannel(client)
  await client.pair({ uri })
  return { client, channel }
}

// Creates a channel to observer for wc client events
// This is the typical way to connect events into saga-land
function createWalletConnectChannel(client: WalletConnectClient) {
  return eventChannel<PayloadAction<any>>((emit) => {
    if (!client) throw new Error('Cannot create WC channel without client')

    const onSessionProposal = (session: SessionTypes.Proposal) => emit(proposeWcSession(session))
    const onSessionCreated = (session: SessionTypes.Settled) => emit(createWcSession(session))
    const onSessionUpdated = (session: SessionTypes.UpdateParams) => emit(updateWcSession(session))
    const onSessionDeleted = (session: SessionTypes.DeleteParams) => emit(deleteWcSession(session))
    const onSessionRequest = (request: SessionTypes.RequestEvent) => emit(requestFromWc(request))
    // const onPairingProposal = (pairing: PairingTypes.ProposeParams) => handlePairingEvent(pairing)
    // const onPairingCreated = (pairing: PairingTypes.CreateParams) => handlePairingEvent(pairing)
    // const onPairingUpdated = (pairing: PairingTypes.UpdateParams) => handlePairingEvent(pairing)
    // const onPairingDeleted = (pairing: PairingTypes.DeleteParams) => handlePairingEvent(pairing)

    client.on(CLIENT_EVENTS.session.proposal, onSessionProposal)
    client.on(CLIENT_EVENTS.session.created, onSessionCreated)
    client.on(CLIENT_EVENTS.session.updated, onSessionUpdated)
    client.on(CLIENT_EVENTS.session.deleted, onSessionDeleted)
    client.on(CLIENT_EVENTS.session.request, onSessionRequest)
    // client.on(CLIENT_EVENTS.pairing.proposal, onPairingProposal)
    // client.on(CLIENT_EVENTS.pairing.created, onPairingCreated)
    // client.on(CLIENT_EVENTS.pairing.updated, onPairingUpdated)
    // client.on(CLIENT_EVENTS.pairing.deleted, onPairingDeleted)

    return () => {
      if (!client) {
        logger.error('WC client already missing before channel cleanup')
        return
      }
      logger.debug('Cleaning up WC channel')
      client.off(CLIENT_EVENTS.session.proposal, onSessionProposal)
      client.off(CLIENT_EVENTS.session.created, onSessionCreated)
      client.off(CLIENT_EVENTS.session.updated, onSessionUpdated)
      client.off(CLIENT_EVENTS.session.deleted, onSessionDeleted)
      client.off(CLIENT_EVENTS.session.request, onSessionRequest)
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
    if (event?.type === proposeWcSession.type) return event.payload as SessionTypes.Proposal
  }
}

// Handle a session proposal
// The user must review the details and approve/reject
function* handleSessionProposal(proposal: SessionTypes.Proposal, client: WalletConnectClient) {
  logger.debug('WalletConnect session proposed')

  yield* put(proposeWcSession(proposal))

  const isValid = yield* call(validateProposal, proposal, client)
  if (!isValid) {
    yield* put(failWcSession('Session proposal is invalid'))
    throw new Error('WalletConnect session proposal invalid')
  }

  const decision = yield* take([approveWcSession.type, rejectWcSession.type])
  if (decision.type == approveWcSession.type) {
    const address = yield* select((s: RootState) => s.wallet.address)
    yield* call(approveClientSession, client, proposal, address)
  } else {
    yield* call(rejectClientSession, client, proposal, 'user denied')
    throw new Error('WalletConnect session proposal rejected')
  }
}

async function validateProposal(proposal: SessionTypes.Proposal, client: WalletConnectClient) {
  if (!proposal) {
    logger.warn('Rejecting WalletConnect session: no proposal')
    await client.reject({ proposal, reason: WcError.MISSING_OR_INVALID.format() })
    return false
  }

  const unsupportedChain = proposal.permissions.blockchain.chains.find(
    (chainId) => !SUPPORTED_CHAINS.includes(chainId)
  )
  if (unsupportedChain) {
    logger.warn(`Rejecting WalletConnect session: unsupported chain ${unsupportedChain}`)
    await client.reject({ proposal, reason: WcError.UNSUPPORTED_CHAINS.format() })
    return false
  }

  const supportedMethods = Object.values(WalletConnectMethod) as string[]
  const unsupportedMethod = proposal.permissions.jsonrpc.methods.find(
    (method) => !supportedMethods.includes(method)
  )
  if (unsupportedMethod) {
    logger.warn(`Rejecting WalletConnect session: unsupported method ${unsupportedMethod}`)
    await client.reject({
      proposal,
      reason: WcError.UNSUPPORTED_JSONRPC.format(),
    })
    return false
  }

  return true
}

function* waitForSessionCreated(channel: EventChannel<PayloadAction<any>>) {
  while (true) {
    const event = yield* take(channel)
    if (event?.type === createWcSession.type) return event.payload as SessionTypes.Settled
  }
}

function approveClientSession(
  client: WalletConnectClient,
  proposal: SessionTypes.Proposal,
  account: string | null
) {
  logger.debug('Approving WalletConnect session proposal')

  if (!account) throw new Error('Cannot approve WC session before creating account')

  const response: ClientTypes.ResponseInput = {
    state: {
      accounts: [`eip155:${config.chainId}:${account}`],
    },
    metadata: APP_METADATA,
  }
  return client.approve({ proposal, response })
}

function rejectClientSession(
  client: WalletConnectClient,
  proposal: SessionTypes.Proposal,
  reason: string
) {
  logger.warn(`Rejecting WalletConnect session: ${reason}`)
  return client.reject({
    proposal,
    reason: WcError.NOT_APPROVED.format(),
  })
}

function* handleSessionCreated(session: SessionTypes.Created) {
  logger.debug('WalletConnect session created')
  yield* put(createWcSession(session))
}

function* handleRequestEvent(event: SessionTypes.RequestEvent, client: WalletConnectClient) {
  logger.debug('WalletConnect session request received')

  try {
    const isValid = yield* call(validateRequestEvent, event, client, denyRequest)
    if (!isValid) return // silently reject invalid requests

    yield* put(requestFromWc(event))

    const { approve, timeout } = yield* race({
      approve: take(approveWcRequest.type),
      reject: take(rejectWcRequest.type),
      timeout: delay(SESSION_REQUEST_TIMEOUT),
    })

    yield* call(handleWalletConnectRequest, event, client, !!approve, approveRequest, denyRequest)
    if (timeout) {
      yield* put(failWcRequest('Request timed out, please try again'))
    }
  } catch (error) {
    logger.error('Error handling request event', error)
    yield* put(failWcRequest(errorToString(error)))
  }
}

export function denyRequest(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  error: WalletConnectError
) {
  logger.debug('Denying WalletConnect request event', event.request.method, error)
  return respond(event, client, undefined, toWcUtilsError(error))
}

export function approveRequest(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  result: any
) {
  logger.debug('Approving WalletConnect request event', event.request.method)
  return respond(event, client, result)
}

function respond(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  result?: any,
  error?: WcErrorType
) {
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

// Map from local error enum's to WC's official ones
// Needed to avoid bundling unpleasantness when dealing with WC V1
function toWcUtilsError(error: WalletConnectError): WcErrorType {
  switch (error) {
    case WalletConnectError.unsupportedJsonRpc:
      return WcError.UNSUPPORTED_JSONRPC
    case WalletConnectError.unsupportedChains:
      return WcError.UNSUPPORTED_CHAINS
    case WalletConnectError.missingOrInvalid:
      return WcError.MISSING_OR_INVALID
    case WalletConnectError.notApproved:
      return WcError.NOT_APPROVED
    default:
      return WcError.UNKNOWN
  }
}

function* closeClient(client: WalletConnectClient, channel: EventChannel<PayloadAction<any>>) {
  logger.info('Closing WalletConnect client')
  if (!client || !channel) {
    logger.error('Attempting to close WC client before properly initialized')
    return
  }
  // Close the event channel to clean it up
  channel.close()
  const session = yield* select((state: RootState) => state.walletConnect.session)
  yield* call(disconnectClient, client, session)
  yield* put(disconnectWcClient())
}

async function disconnectClient(client: WalletConnectClient, session: WalletConnectSession | null) {
  logger.debug('Disconnecting WalletConnect Client')

  // Remove any listeners that may remain
  // client.relayer.provider.events.removeAllListeners()
  client.session.events.removeAllListeners()
  client.pairing.events.removeAllListeners()

  // Disconnect the active session if there is one
  const reason = WcError.USER_DISCONNECTED.format()
  if (session && session.status === SessionStatus.Settled) {
    try {
      await client.disconnect({
        topic: session.data.topic,
        reason,
      })
    } catch (error) {
      logger.error('Error disconnecting WalletConnect client', error)
    }
  }

  // // To be thorough, also clean up the sessions and pairings, may revisit later
  // for (const topic of client.session.topics) {
  //   try {
  //     await client.session.delete({ topic, reason })
  //   } catch (error) {
  //     logger.warn('Error deleting WalletConnect session', error)
  //   }
  // }
  // for (const topic of client.session.pending.topics) {
  //   try {
  //     await client.session.pending.delete(topic, reason)
  //   } catch (error) {
  //     logger.warn('Error deleting WalletConnect session', error)
  //   }
  // }
  // for (const topic of client.pairing.topics) {
  //   try {
  //     await client.pairing.delete({ topic, reason })
  //   } catch (error) {
  //     logger.warn('Error deleting WalletConnect session', error)
  //   }
  // }
  // for (const topic of client.pairing.pending.topics) {
  //   try {
  //     await client.pairing.pending.delete(topic, reason)
  //   } catch (error) {
  //     logger.warn('Error deleting WalletConnect session', error)
  //   }
  // }

  // Finally, disconnect from the relayer to kill the websocket connection
  // try {
  //   await client.relayer.provider.disconnect()
  // } catch (error) {
  //   logger.warn('Error disconnection form WalletConnect relayer', error)
  // }

  logger.debug('WalletConnect client disconnected')
}
