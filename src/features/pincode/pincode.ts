import { isSignerSet } from 'src/blockchain/signer'
import { importWallet } from 'src/features/wallet/importWallet'
import { loadWallet, saveWallet } from 'src/features/wallet/storage'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

const CACHE_TIMEOUT = 600000 // 10 minutes
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

function getCachedPin() {
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

export function isAccountUnlocked() {
  return !!getCachedPin()
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

  if (!isSignerSet()) {
    throw new Error('Account not setup yet')
  }

  yield* call(saveWallet, pin)

  setCachedPin(pin)
  logger.info('Pin set')
}

function* unlockWallet(pin: string) {
  if (!isPinValid(pin)) {
    throw new Error('Invalid Pin')
  }

  const mnemonic = yield* call(loadWallet, pin)
  if (!mnemonic) {
    throw new Error('Incorrect Pin or Missing Wallet')
  }

  setCachedPin(pin)
  logger.info('Account unlocked')

  // If account has not yet been imported
  if (!isSignerSet()) {
    yield* call(importWallet, mnemonic)
  }
}
