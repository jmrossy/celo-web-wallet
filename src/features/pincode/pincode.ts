import { RootState } from 'src/app/rootReducer'
import { isSignerSet } from 'src/blockchain/signer'
import { ACCOUNT_UNLOCK_TIMEOUT, CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { PincodeAction, SecretType } from 'src/features/pincode/types'
import { isSecretTooSimple, secretTypeToLabel } from 'src/features/pincode/utils'
import { importWallet } from 'src/features/wallet/importWallet'
import { loadWallet, saveWallet } from 'src/features/wallet/storage'
import {
  resetWallet,
  setDerivationPath,
  setSecretType,
  setWalletUnlocked,
} from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

const PIN_LENGTH = 6

export interface PincodeParams {
  action: PincodeAction
  value: string
  valueConfirm?: string
  newValue?: string
  type?: SecretType
}

export function validate(params: PincodeParams): ErrorState {
  const { action, value, newValue, valueConfirm, type } = params
  const isPin = type === 'pincode'

  let errors: ErrorState = { isValid: true }

  if (!value) {
    return { ...errors, ...invalidInput('value', 'Value is required') }
  } else if (value.length < PIN_LENGTH) {
    return { ...errors, ...invalidInput('value', 'Value is too short') }
  }

  if (action === PincodeAction.Set) {
    if (isPin && value.length !== PIN_LENGTH) {
      errors = { ...errors, ...invalidInput('value', 'Pincode must be 6 digits') }
    } else if (isSecretTooSimple(value, type)) {
      errors = { ...errors, ...invalidInput('value', 'Value is too simple') }
    }
    if (!valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
    } else if (value !== valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', "Values don't match") }
    }
  }

  if (action === PincodeAction.Change) {
    if (!newValue) {
      errors = { ...errors, ...invalidInput('newValue', 'New value is required') }
    } else {
      if (isPin && newValue.length !== PIN_LENGTH) {
        errors = { ...errors, ...invalidInput('newValue', 'New Pincode must be 6 numbers') }
      } else if (isSecretTooSimple(newValue, type)) {
        errors = { ...errors, ...invalidInput('newValue', 'New value is too simple') }
      } else if (newValue === value) {
        errors = { ...errors, ...invalidInput('newValue', 'New value is unchanged') }
      }
      if (!valueConfirm) {
        errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
      } else if (newValue !== valueConfirm) {
        errors = { ...errors, ...invalidInput('valueConfirm', "New values don't match") }
      }
    }
  }

  return errors
}

let accountUnlockedTime: number

export function isAccountUnlocked() {
  return accountUnlockedTime && Date.now() - accountUnlockedTime < ACCOUNT_UNLOCK_TIMEOUT
}

function updateUnlockedTime() {
  accountUnlockedTime = Date.now()
}

function* pincode(params: PincodeParams) {
  validateOrThrow(() => validate(params), 'Invalid Pincode or Password')

  const { action, value, newValue, type } = params
  if (!type) throw new Error('Missing secret type')

  if (action === PincodeAction.Set) {
    yield* call(setPin, value, type)
  } else if (action === PincodeAction.Unlock) {
    yield* call(unlockWallet, value, type)
  } else if (action === PincodeAction.UnlockAndRecover) {
    yield* call(unlockAndRecoverWallet, value, type)
  } else if (action === PincodeAction.Change) {
    if (!newValue) throw new Error('Missing new value')
    yield* call(changePin, value, newValue, type)
  }
}

export const {
  name: pincodeSagaName,
  wrappedSaga: pincodeSaga,
  reducer: pincodeReducer,
  actions: pincodeActions,
} = createMonitoredSaga<PincodeParams>(pincode, 'pincode')

function* setPin(pin: string, type: SecretType) {
  if (!isSignerSet()) {
    throw new Error('Account not setup yet')
  }

  yield* call(saveWallet, pin)
  yield* put(setSecretType(type))
  yield* put(setWalletUnlocked(true))

  updateUnlockedTime()
  logger.info(`${type} set`)
}

function* unlockWallet(pin: string, type: SecretType) {
  const mnemonic = yield* call(loadWallet, pin)
  if (!mnemonic) {
    throw new Error(`Incorrect ${secretTypeToLabel(type)[0]} or missing wallet`)
  }

  const derivationPath = yield* select((s: RootState) => s.wallet.derivationPath)
  if (!derivationPath) {
    throw new Error('Key found but derivation path is missing')
  }

  updateUnlockedTime()
  logger.info('Account unlocked')

  // If account has not yet been imported
  if (!isSignerSet()) {
    yield* call(importWallet, { mnemonic, derivationPath })
  }
  yield* put(setWalletUnlocked(true))
}

// In rare cases, redux-persist seems to loses some persisted state, possibly due to
// bad migrations. But the key is safe. This handles that case.
// Note, if ever there is crucial state stored in a slice other than walletSlice, this would
// need to account for that.
function* unlockAndRecoverWallet(pin: string, type: SecretType) {
  yield* put(resetWallet())
  yield* put(resetFeed())
  yield* put(setSecretType(type))
  // Note, this assumes the wallet was using the default Celo derivation path
  // TODO consider adding derivation path field to enter pincode screen in this recovery case.
  yield* put(setDerivationPath(CELO_DERIVATION_PATH + '/0'))
  yield* call(unlockWallet, pin, type)
}

function* changePin(existingPin: string, newPin: string, type: SecretType) {
  if (!isSignerSet()) {
    throw new Error('Account not setup yet')
  }

  const mnemonic = yield* call(loadWallet, existingPin)
  if (!mnemonic) {
    throw new Error(`Incorrect ${secretTypeToLabel(type)[0]} or missing wallet`)
  }

  yield* call(saveWallet, newPin, true)
  yield* put(setSecretType(type))
  yield* put(setWalletUnlocked(true))

  updateUnlockedTime()
  logger.info(`${type} changed`)
}
