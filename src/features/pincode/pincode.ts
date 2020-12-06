import { isSignerSet } from 'src/blockchain/signer'
import { importWallet } from 'src/features/wallet/importWallet'
import { loadWallet, saveWallet } from 'src/features/wallet/storage'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

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

export enum PincodeAction {
  Set,
  Unlock,
  Change,
}
export interface PincodeParams {
  action: PincodeAction
  value: string
  valueConfirm?: string
  newValue?: string
}

export function isPinValid(pin: string) {
  return pin.length === PIN_LENGTH && !PIN_BLACKLIST.includes(pin)
}

export function validate(params: PincodeParams): ErrorState {
  const { action, value, newValue, valueConfirm } = params
  let errors: ErrorState = { isValid: true }

  if (!value) {
    errors = { ...errors, ...invalidInput('value', 'Pincode is required') }
  } else {
    if (value.length !== PIN_LENGTH) {
      errors = { ...errors, ...invalidInput('value', 'Pincode must be 6 numbers') }
    } else if (!isPinValid(value)) {
      errors = { ...errors, ...invalidInput('value', 'Pincode is too simple') }
    }
  }
  if (action === PincodeAction.Set) {
    if (!valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
    } else if (value !== valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', "Values don't match") }
    }
  } else if (action === PincodeAction.Change) {
    if (!newValue) {
      errors = { ...errors, ...invalidInput('newValue', 'New Pincode is required') }
    } else {
      if (newValue.length !== PIN_LENGTH) {
        errors = { ...errors, ...invalidInput('newValue', 'New Pincode must be 6 numbers') }
      } else if (!isPinValid(newValue)) {
        errors = { ...errors, ...invalidInput('newValue', 'New Pincode is too simple') }
      } else if (newValue !== valueConfirm) {
        errors = { ...errors, ...invalidInput('valueConfirm', "New Pincodes don't match") }
      } else if (newValue === value) {
        errors = { ...errors, ...invalidInput('newValue', 'New Pincodes is unchanged') }
      }
    }
  }

  return errors
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

function setCachedPin(pin: string | null | undefined) {
  if (pin) {
    pinCache.timestamp = Date.now()
    pinCache.secret = pin
  } else {
    clearPinCache()
  }
}

function clearPinCache() {
  pinCache = {}
}

export function isAccountUnlocked() {
  return !!getCachedPin()
}

function* pincode({ value, newValue, action }: PincodeParams) {
  if (action === PincodeAction.Set) {
    yield* call(setPin, value)
  } else if (action === PincodeAction.Unlock) {
    yield* call(unlockWallet, value)
  } else if (action === PincodeAction.Change) {
    if (!newValue) throw new Error('Missing new pin')
    yield* call(changePin, value, newValue)
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
  yield* put(setWalletUnlocked(true))

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

function* changePin(existingPin: string, newPin: string) {
  if (!isPinValid(existingPin)) {
    throw new Error('Invalid Existing Pin')
  }

  if (!isPinValid(newPin)) {
    throw new Error('Invalid New Pin')
  }

  if (!isSignerSet()) {
    throw new Error('Account not setup yet')
  }

  const mnemonic = yield* call(loadWallet, existingPin)
  if (!mnemonic) {
    throw new Error('Incorrect Pin or Missing Wallet')
  }

  yield* call(saveWallet, newPin)

  setCachedPin(newPin)
  logger.info('Pin changed')
}
