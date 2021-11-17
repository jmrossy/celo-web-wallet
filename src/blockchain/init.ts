import { connectToProvider } from './provider'
import { setIsConnected } from '../features/wallet/walletSlice'
import { logger } from '../utils/logger'
import { call, put } from 'typed-redux-saga'

export function* initProvider() {
  try {
    yield* call(connectToProvider)
    yield* put(setIsConnected(true))
  } catch (error) {
    logger.error('Unable to connect to provider', error)
    yield* put(setIsConnected(false))
  }
}
