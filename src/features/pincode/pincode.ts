import { RootState } from 'src/app/rootReducer'
import { importWallet } from 'src/features/wallet/importWallet'
import { loadWallet, saveWallet } from 'src/features/wallet/storage'
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

// TODO: Not currently used
export function getCachedPin() {
  if (pinCache.secret && pinCache.timestamp && Date.now() - pinCache.timestamp < CACHE_TIMEOUT) {
    return pinCache.secret
  } else {
    // Clear values in cache when they're expired
    clearPinCache()
    return null
  }
}

// TODO: Not currently used
export function setCachedPin(pin: string | null | undefined) {
  if (pin) {
    pinCache.timestamp = Date.now()
    pinCache.secret = pin
  } else {
    clearPinCache()
  }
}

// TODO: Not currently used
export function clearPinCache() {
  pinCache = {}
}

export enum PincodeAction {
  Set,
  Unlock,
  Change,
}

interface PincodeParams {
  value: string
  action: PincodeAction
}

function* pincode({ value, action }: PincodeParams) {
  if (action === PincodeAction.Set) {
    yield* call(setPin, value)
  } else if (action === PincodeAction.Unlock) {
    yield* call(unlockWallet, value)
  } else if (action === PincodeAction.Change) {
    throw new Error('TODO: Not yet implemented')
  }
}

export const {
  name: pincodeSagaName,
  wrappedSaga: pincodeSaga,
  reducer: pincodeReducer,
  actions: pincodeActions,
} = createMonitoredSaga<PincodeParams>(pincode, 'pincode')

function* setPin(pin: string) {
  if (!isPinValid(pin)) {
    throw new Error('Invalid Pin')
  }

  const address = yield* select((state: RootState) => state.wallet.address)
  if (!address) {
    throw new Error('Account not setup yet')
  }

  yield* call(saveWallet, pin)

  // setCachedPin(pin)
}

function* unlockWallet(pin: string) {
  if (!isPinValid(pin)) {
    throw new Error('Invalid Pin')
  }

  const address = yield* select((state: RootState) => state.wallet.address)
  if (address) {
    throw new Error('Wallet already loaded and unlocked')
  }

  const mnemonic = yield* call(loadWallet, pin)
  if (!mnemonic) {
    throw new Error('No mnemonic retrieved')
  }

  yield* call(importWallet, mnemonic)

  // setCachedPin(pin)
}
