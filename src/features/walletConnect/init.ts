import { PayloadAction } from '@reduxjs/toolkit'
import {
  disconnectWcClient,
  failWcSession,
  initializeWcClient,
} from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { call, cancel, put, spawn, take } from 'typed-redux-saga'

let runWalletConnectSessionFn: any

// This watches for init action dispatches and forks off a saga
// to run the session
export function* watchWalletConnect() {
  while (true) {
    const initAction = (yield* take(initializeWcClient.type)) as PayloadAction<string>
    logger.debug('Starting new WalletConnect session')

    const sessionRunner = yield* call(dynamicImportWalletConnect)
    if (!sessionRunner) {
      yield* put(failWcSession('Could not load bundle'))
      continue
    }

    const uri = initAction.payload
    const sessionTask = yield* spawn(sessionRunner, uri)

    yield* take(disconnectWcClient.type) // todo timeout in case disconnect action never sent?
    yield* cancel(sessionTask)
    logger.debug('WalletConnect session finishing')
  }
}

// Dynamic importing for code splitting
// The WalletConnect bundle is large and includes many libs
async function dynamicImportWalletConnect() {
  if (runWalletConnectSessionFn) return runWalletConnectSessionFn

  try {
    logger.debug('Fetching WalletConnect bundle')
    const wcModule = await import(
      /* webpackChunkName: "walletconnect" */ 'src/features/walletConnect/walletConnect'
    )
    logger.debug('Done fetching WalletConnect bundle')
    runWalletConnectSessionFn = wcModule.runWalletConnectSession
    return runWalletConnectSessionFn
  } catch (error) {
    logger.error('Failed to load WalletConnect bundle', error)
    return null
  }
}
