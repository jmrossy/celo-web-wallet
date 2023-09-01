import { PayloadAction } from '@reduxjs/toolkit'
import { appSelect } from 'src/app/appSelect'
import { WalletConnectVersion } from 'src/features/walletConnect/types'
import { getWalletConnectVersion } from 'src/features/walletConnect/utils'
import {
  disconnectWcClient,
  failWcSession,
  initializeWcClient,
} from 'src/features/walletConnect/walletConnectSlice'
import { logger } from 'src/utils/logger'
import { call, cancel, put, spawn, take } from 'typed-redux-saga'

let runWalletConnectV2SessionFn: any

// This watches for init action dispatches and forks off a saga
// to run the session
export function* watchWalletConnect() {
  while (true) {
    const initAction = (yield* take(initializeWcClient.type)) as PayloadAction<string>
    const uri = initAction.payload
    logger.debug('Starting new WalletConnect session')

    const address = yield* appSelect((state) => state.wallet.address)
    if (!address) {
      yield* put(failWcSession('Must setup account first'))
      continue
    }

    const version = getWalletConnectVersion(uri)
    if (!version) {
      yield* put(failWcSession('Cannot determine WC version'))
      continue
    }

    const sessionRunner = yield* call(dynamicImportWalletConnect, version)
    if (!sessionRunner) {
      yield* put(failWcSession('Could not load bundle'))
      continue
    }

    const sessionTask = yield* spawn(sessionRunner, uri)

    yield* take(disconnectWcClient.type)
    yield* cancel(sessionTask)
    logger.debug('WalletConnect session finishing')
  }
}

// Dynamic importing for code splitting
// The WalletConnect bundle is large and includes many libs
async function dynamicImportWalletConnect(version: WalletConnectVersion) {
  if (version === 2 && runWalletConnectV2SessionFn) return runWalletConnectV2SessionFn

  try {
    logger.debug('Fetching WalletConnect V2 bundle')
    const wcModule2 = await import(
      /* webpackChunkName: "walletconnect2" */ 'src/features/walletConnect/walletConnect'
    )
    runWalletConnectV2SessionFn = wcModule2.runWalletConnectSession
    logger.debug('Done fetching WalletConnect V2 bundle')
    return runWalletConnectV2SessionFn
  } catch (error) {
    logger.error('Failed to load WalletConnect bundle', error)
    return null
  }
}
