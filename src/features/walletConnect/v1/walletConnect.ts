import 'src/polyfills/buffer' // Should be the first import
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
} from 'src/features/walletConnect/config'
import { WalletConnectError, WalletConnectMethod } from 'src/features/walletConnect/types'
import { IJsonRpcRequest, ISessionParams } from 'src/features/walletConnect/v1/types'
import {
  handleWalletConnectRequest,
  validateRequestEvent,
} from 'src/features/walletConnect/walletConnectReqHandler'
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
import { logger } from 'src/utils/logger'
import { withTimeout } from 'src/utils/timeout'
import { errorToString } from 'src/utils/validation'
import { call, cancelled, delay, fork, put, race, select, take } from 'typed-redux-saga'
import WalletConnectClient from 'wcv1/client'
import type { SessionTypes } from 'wcv2/types'

/**
 * HACKINESS WARNING:
 *
 * v1 support was added after v2
 * To avoid reworking the UI, slice, etc., the v1 format has been
 * shoe-horned into v2. The conversion happens in the saga channel.
 * Don't trust the types for session/request data, the real objects
 * only have a subset of the real type (the subset available in v1)
 *
 * This could certainly be better but a unified v1-v2 lib
 * is in progress by WalletConnect already so not worth it.
 *  */

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
        throw new Error('DApp disconnected from the session')
      }
      if (type === proposeWcSession.type) {
        logger.warn('Ignoring new session proposal while one is active')
      }
      if (type === requestFromWc.type) {
        const requestEvent = payload as SessionTypes.RequestEvent
        yield* fork(handleRequestEvent, requestEvent, client)
      }
    }
  } catch (error) {
    // Note, saga-quirk: errors from fork calls won't be caught here
    yield* put(failWcSession(errorToString(error)))
    logger.error('Error during WalletConnect V1 session', error)
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
  const client = new WalletConnectClient({
    uri,
    clientMeta: APP_METADATA,
  })
  if (!client.connected) {
    await client.createSession()
  }
  // Set up channel to watch for events
  const channel = createWalletConnectChannel(client)
  return { client, channel }
}

// Creates a channel to observer for wc client events
// This is the typical way to connect events into saga-land
function createWalletConnectChannel(client: WalletConnectClient) {
  return eventChannel<PayloadAction<any>>((emit) => {
    if (!client) throw new Error('Cannot create WC channel without client')

    const onSessionProposal = (error: any, payload: IJsonRpcRequest<ISessionParams>) => {
      if (error) {
        logger.error('Error in onSessionProposal', error)
        return
      }
      const params = payload.params[0]
      const session = {
        proposer: {
          metadata: params.peerMeta,
        },
        permissions: {
          blockchain: {
            chains: [`eip155:${params.chainId}`],
          },
          jsonrpc: {
            methods: Object.values(WalletConnectMethod),
          },
        },
      } as any
      emit(proposeWcSession(session))
    }

    // TODO add types and implement if needed
    const onSessionUpdated = (error: any, payload: any) => {
      logger.warn('onSessionUpdated not yet implemented', payload, error)
    }

    const onSessionCreated = (error: any, payload: IJsonRpcRequest<ISessionParams>) => {
      if (error) {
        logger.error('Error in onSessionCreated', error)
        return
      }
      const params = payload.params[0]
      const session = {
        peer: {
          metadata: params.peerMeta,
        },
        permissions: {
          jsonrpc: {
            methods: Object.values(WalletConnectMethod),
          },
        },
      } as any
      emit(createWcSession(session))
    }

    const onSessionDeleted = () => {
      emit(deleteWcSession({ topic: '', reason: 'DApp Disconnected' as any }))
    }
    const onSessionRequest = (error: any, payload: IJsonRpcRequest<unknown>) => {
      if (error) {
        logger.error('Error in onSessionRequest', error)
        return
      }
      const { id, method, params } = payload
      const request = {
        chainId: `eip155:${config.chainId}`, // v1 does not include this in requests so manually setting it
        request: {
          id,
          method,
          params: params[0],
        },
      } as any
      emit(requestFromWc(request))
    }
    client.on('session_request', onSessionProposal)
    client.on('session_update', onSessionUpdated)
    client.on('connect', onSessionCreated)
    client.on('disconnect', onSessionDeleted)
    client.on('call_request', onSessionRequest)

    return () => {
      if (!client) {
        logger.error('WC client already missing before channel cleanup')
        return
      }
      logger.debug('Cleaning up WC channel')
      client.off('session_request')
      client.off('session_update')
      client.off('connect')
      client.off('disconnect')
      client.off('call_request')
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

  // Note it would be nice to validate here like we do for v2
  // but the v1 session proposal doesn't have much to validate.
  // It does have a chainId but it's often incorrect until after
  // the session has been established.
  // const isValid = yield* call(validateProposal, proposal, client)
  // if (!isValid) {
  //   yield* put(failWcSession('Session proposal is invalid'))
  //   throw new Error('WalletConnect session proposal invalid')
  // }

  const decision = yield* take([approveWcSession.type, rejectWcSession.type])
  if (decision.type == approveWcSession.type) {
    const address = yield* select((s: RootState) => s.wallet.address)
    yield* call(approveClientSession, client, address)
  } else {
    yield* call(rejectClientSession, client, 'user denied')
    throw new Error('WalletConnect session proposal rejected')
  }
}

function* waitForSessionCreated(channel: EventChannel<PayloadAction<any>>) {
  while (true) {
    const event = yield* take(channel)
    if (event?.type === createWcSession.type) return event.payload as SessionTypes.Settled
  }
}

function approveClientSession(client: WalletConnectClient, account: string | null) {
  logger.debug('Approving WalletConnect session proposal')
  if (!account) throw new Error('Cannot approve WC session before creating account')
  return client.approveSession({ chainId: config.chainId, accounts: [account] })
}

function rejectClientSession(client: WalletConnectClient, reason: string) {
  logger.warn(`Rejecting WalletConnect session: ${reason}`)
  return client.rejectSession({ message: reason })
}

function* handleSessionCreated(session: SessionTypes.Settled) {
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

export async function denyRequest(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  error: WalletConnectError
): Promise<void> {
  logger.debug('Denying WalletConnect request event', event.request.method, error)
  await client.rejectRequest({
    id: event.request.id,
    error: { code: -32000, message: error },
  })
  return
}

export async function approveRequest(
  event: SessionTypes.RequestEvent,
  client: WalletConnectClient,
  result: any
): Promise<void> {
  logger.debug('Approving WalletConnect request event', event.request.method)
  await client.approveRequest({
    id: event.request.id,
    result,
  })
  return
}

function* closeClient(client: WalletConnectClient, channel: EventChannel<PayloadAction<any>>) {
  logger.info('Closing WalletConnect client')
  if (!client || !channel) {
    logger.error('Attempting to close WC client before properly initialized')
    return
  }
  // Close the event channel to clean it up
  channel.close()
  yield* call(disconnectClient, client)
  yield* put(disconnectWcClient())
}

async function disconnectClient(client: WalletConnectClient) {
  logger.debug('Disconnecting WalletConnect Client')
  try {
    await client.killSession()
  } catch (error) {
    logger.error('Error disconnecting WalletConnect client', error)
  }
  logger.debug('WalletConnect client disconnected')
}
