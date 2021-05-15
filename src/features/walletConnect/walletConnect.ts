import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { EventChannel, eventChannel } from '@redux-saga/core'
import { call as rawCall } from '@redux-saga/core/effects'
import { PayloadAction } from '@reduxjs/toolkit'
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { ERROR as WalletConnectErrors, getError } from '@walletconnect/utils'
import { RootState } from 'src/app/rootReducer'
import { config } from 'src/config'
import 'src/features/ledger/buffer' // Must be the first import // TODO remove
import {
  SessionType,
  WalletConnectRequestParams,
  WalletConnectSession,
  WalletConnectUriForm,
} from 'src/features/walletConnect/types'
import { handleWalletConnectRequest } from 'src/features/walletConnect/walletConnectReqHandler'
import {
  approveWcRequest,
  approveWcSession,
  createWcSession,
  deleteWcSession,
  disconnectWcClient,
  failWcSession,
  initializeWcClient,
  proposeWcSession,
  rejectWcRequest,
  rejectWcSession,
  requestFromWc,
  updateWcSession,
} from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { withTimeout } from 'src/utils/timeout'
import { ErrorState, invalidInput } from 'src/utils/validation'
import {
  call,
  cancel,
  cancelled,
  delay,
  fork,
  put,
  race,
  select,
  spawn,
  take,
} from 'typed-redux-saga'

export enum WalletConnectMethods {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  sendTransaction = 'eth_sendTransaction',
  personalSign = 'personal_sign',
  signTypedData = 'eth_signTypedData',
  decrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}

const APP_METADATA = {
  name: 'CeloWallet.app',
  description: 'Celo Wallet for Web and Desktop', // TODO differentiate based on env?
  url: 'https://celowallet.app',
  icons: ['https://celowallet.app/static/icon.png'],
}

// alfajores, mainnet, baklava
// TODO reject requests for chains other than one currently configured
const SUPPORTED_CHAINS = ['celo:44787', 'celo:42220', 'celo:62320']

const SESSION_INIT_TIMEOUT = 15000 // 15 seconds
const SESSION_PROPOSAL_TIMEOUT = 120000 // 2 minutes
const SESSION_REQUEST_TIMEOUT = 300000 // 5 minutes

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

// This watches for init action dispatches and forks off a saga
// to run the session
export function* watchWalletConnect() {
  while (true) {
    const initAction = (yield* take(initializeWcClient.type)) as PayloadAction<string>
    const uri = initAction.payload
    logger.debug('Starting new WalletConnect session')
    const sessionTask = yield* spawn(runWalletConnectSession, uri)
    yield* take(disconnectWcClient.type) // todo timeout in case disconnect action never sent?
    yield* cancel(sessionTask)
    logger.debug('WalletConnect session finished')
  }
}

// This is what actually interacts with the WC client
// It initializes it, pairs it, and handles events
function* runWalletConnectSession(uri: string) {
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
      console.log('event from channel', event)
      if (!event || !event.type) {
        logger.error(`Invalid WC event from channel: ${JSON.stringify(event)}`)
        continue
      }
      const { type, payload } = event
      if (type === proposeWcSession.type) {
        logger.warn('Ignoring new session proposal while one is active')
      }
      if (type === requestFromWc.type) {
        yield* fork(handleRequestEvent, payload, client)
      }
    }
  } catch (error) {
    // Note, saga-quirk: errors from fork calls won't be caught here
    yield* put(failWcSession(error.message))
    logger.error('Error during WalletConnect session', error)
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
    relayProvider: config.walletConnectRelay,
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

function* waitForSessionCreated(channel: EventChannel<PayloadAction<any>>) {
  while (true) {
    const event = yield* take(channel)
    if (event?.type === createWcSession.type) return event.payload as SessionTypes.Settled
  }
}

async function validateProposal(proposal: SessionTypes.Proposal, client: WalletConnectClient) {
  if (!proposal) {
    logger.warn('Rejecting WalletConnect session: no proposal')
    await client.reject({ proposal, reason: getError(WalletConnectErrors.MISSING_OR_INVALID) })
    return false
  }

  if (
    proposal.permissions.blockchain.chains.find((chainId) => !SUPPORTED_CHAINS.includes(chainId))
  ) {
    logger.warn('Rejecting WalletConnect session: unsupported chain')
    await client.reject({ proposal, reason: getError(WalletConnectErrors.UNSUPPORTED_CHAINS) })
    return false
  }

  const supportedMethods = Object.values(WalletConnectMethods) as string[]
  if (proposal.permissions.jsonrpc.methods.find((method) => !supportedMethods.includes(method))) {
    logger.warn('Rejecting WalletConnect session: unsupported method')
    await client.reject({
      proposal,
      reason: getError(WalletConnectErrors.UNSUPPORTED_JSONRPC),
    })
    return false
  }

  return true
}

async function approveClientSession(
  client: WalletConnectClient,
  proposal: SessionTypes.Proposal,
  account: string | null
) {
  logger.debug('Approving WalletConnect session proposal')

  if (!account) throw new Error('Cannot approve WC session before creating account')

  const response: SessionTypes.Response = {
    state: {
      accounts: [`${account}@celo:${config.chainId}`],
    },
    metadata: APP_METADATA,
  }
  await client.approve({ proposal, response })
}

async function rejectClientSession(
  client: WalletConnectClient,
  proposal: SessionTypes.Proposal,
  reason: string
) {
  logger.warn(`Rejecting WalletConnect session: ${reason}`)
  await client.reject({
    proposal,
    reason: getError(WalletConnectErrors.NOT_APPROVED),
  })
}

function* handleSessionCreated(session: SessionTypes.Created) {
  logger.debug('WalletConnect session created')
  yield* put(createWcSession(session))
}

function* handleRequestEvent(requestEvent: SessionTypes.RequestEvent, client: WalletConnectClient) {
  logger.debug('WalletConnect session request received')

  yield* put(requestFromWc(requestEvent))

  const { approve, reject, timeout } = yield* race({
    approve: take(approveWcRequest.type),
    reject: take(rejectWcRequest.type),
    timeout: delay(SESSION_REQUEST_TIMEOUT),
  })
  if (approve) {
    // Actually handle the request and form response
    yield* call(handleWalletConnectRequest, client, true)
  } else if (reject || timeout) {
    yield* call(handleWalletConnectRequest, client, false) // todo user feedback?
  } else {
    throw new Error('Unexpected result in handleSessionProposal')
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
  const reason = getError(WalletConnectErrors.USER_DISCONNECTED)
  if (session && session.type === SessionType.Settled) {
    try {
      await client.disconnect({
        topic: session.data.topic,
        reason,
      })
    } catch (error) {
      logger.error('Error disconnecting WalletConnect client', error)
    }
  } else {
    logger.warn('WalletConnect client cannot disconnect without a settled session')
  }
  // To be thorough, also clean up the pending topics, may revisit later
  for (const topic of client.session.pending.topics) {
    try {
      await client.session.pending.delete(topic, reason)
    } catch (error) {
      logger.warn('Error deleting WalletConnect session', error)
    }
  }

  // To be thorough, also clean up the pairings, may revisit later
  for (const topic of client.pairing.topics) {
    try {
      await client.pairing.delete({ topic, reason })
    } catch (error) {
      logger.warn('Error deleting WalletConnect session', error)
    }
  }

  logger.debug('WalletConnect client disconnected')
}

export async function createWalletConnectTxRequest(params: WalletConnectRequestParams) {
  // TODO
  return {
    to: params.data.to,
    value: '0',
  } as CeloTransactionRequest
}
