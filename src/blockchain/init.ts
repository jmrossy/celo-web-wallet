import { connectToProvider } from 'src/blockchain/provider'
import { setIsConnected } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
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
