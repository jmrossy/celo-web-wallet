import { RootState } from 'src/app/rootReducer'
import { saveWallet } from 'src/features/wallet/storage'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, select } from 'typed-redux-saga'

const CACHE_TIMEOUT = 300000 // 5 minutes
const PIN_LENGTH = 6

const PIN_BLACKLIST = [
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
]

export function isPinValid(pin: string) {
  return pin.length === PIN_LENGTH && !PIN_BLACKLIST.includes(pin)
}

interface SecretCache {
  timestamp?: number
  secret?: string
}
let pinCache: SecretCache = {}

export function getCachedPin() {
  if (pinCache.secret && pinCache.timestamp && Date.now() - pinCache.timestamp < CACHE_TIMEOUT) {
    return pinCache.secret
  } else {
    // Clear values in cache when they're expired
    clearPinCache()
    return null
  }
}

export function setCachedPin(pin: string | null | undefined) {
  if (pin) {
    pinCache.timestamp = Date.now()
    pinCache.secret = pin
  } else {
    clearPinCache()
  }
}

export function clearPinCache() {
  pinCache = {}
}

function* setPin(pin: string) {
  if (!isPinValid(pin)) {
    throw new Error('Invalid Pin')
  }

  const address = yield* select((state: RootState) => state.wallet.address)

  if (!address) {
    throw new Error('Account not setup yet')
  }

  setCachedPin(pin)
  yield* call(saveWallet, pin)
}

export const {
  wrappedSaga: setPinSaga,
  reducer: setPinReducer,
  actions: setPinActions,
} = createMonitoredSaga<string>(setPin, 'setPin')
