import { shallowEqual, useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { isSignerSet, SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { PasswordAction, SecretType } from 'src/features/password/types'
import {
	secretTypeToLabel,
	validatePasswordValue,
	validatePinValue
} from 'src/features/password/utils'
import { loadWallet, saveWallet } from 'src/features/wallet/storage_v1'
import {
	resetWallet,
	setDerivationPath,
	setSecretType,
	setWalletUnlocked
} from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export interface PasswordParams {
  action: PasswordAction
  value: string
  valueConfirm?: string
  newValue?: string
  type?: SecretType
}

export function validate(params: PasswordParams): ErrorState {
  const { action, value, newValue, valueConfirm, type } = params
  const isPin = type === 'pincode'

  let errors: ErrorState = { isValid: true }

  if (!value) {
    return invalidInput('value', 'Value is required')
  }

  if (action === PasswordAction.Set) {
    if (isPin) {
      errors = { ...errors, ...validatePinValue(value, 'value') }
    } else {
      errors = { ...errors, ...validatePasswordValue(value, 'value') }
    }
    if (!valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
    } else if (value !== valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', 'Values do not match') }
    }
  }

  if (action === PasswordAction.Change) {
    if (!newValue) {
      return invalidInput('newValue', 'New value is required')
    }
    if (newValue === value) {
      errors = { ...errors, ...invalidInput('newValue', 'New value is unchanged') }
    }
    if (isPin) {
      errors = { ...errors, ...validatePinValue(value, 'newValue') }
    } else {
      errors = { ...errors, ...validatePasswordValue(value, 'newValue') }
    }
    if (!valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
    } else if (newValue !== valueConfirm) {
      errors = { ...errors, ...invalidInput('valueConfirm', "New values do not match") }
    }
  }

  return errors
}

let accountUnlockedTime: number

export function isAccountUnlocked() {
  // TODO implement account timeout feature
  return !!accountUnlockedTime
  // return accountUnlockedTime && Date.now() - accountUnlockedTime < ACCOUNT_UNLOCK_TIMEOUT
}

export function useAccountLockStatus() {
  // Using individual selects here to avoid re-renders this high-level
  // components that use this hook
  const address = useSelector((s: RootState) => s.wallet.address, shallowEqual)
  const type = useSelector((s: RootState) => s.wallet.type, shallowEqual)
  const _isUnlocked = useSelector((s: RootState) => s.wallet.isUnlocked, shallowEqual)
  // TODO necessary to watch for state changes until auto-timeout unlock is fully implemented
  useSelector((s: RootState) => s.saga.password.status, shallowEqual)

  // Call to isAccountUnlocked() is for security reasons (so user can't change a persisted value in local storage)
  // and _isUnlocked is for flow reasons - so the UI reacts to changes after authenticating
  const isUnlocked =
    address &&
    ((_isUnlocked && (isAccountUnlocked() || type === SignerType.Ledger)) ||
      !!config.defaultAccount)

  return { address, type, isUnlocked }
}

function updateUnlockedTime() {
  accountUnlockedTime = Date.now()
}

function* password(params: PasswordParams) {
  validateOrThrow(() => validate(params), 'Invalid Pincode or Password')

  const { action, value, newValue, type } = params
  if (!type) throw new Error('Missing secret type')

  if (action === PasswordAction.Set) {
    yield* call(setPassword, value, type)
  } else if (action === PasswordAction.Unlock) {
    yield* call(unlockWallet, value, type)
  } else if (action === PasswordAction.UnlockAndRecover) {
    yield* call(unlockAndRecoverWallet, value, type)
  } else if (action === PasswordAction.Change) {
    if (!newValue) throw new Error('Missing new value')
    yield* call(changePassword, value, newValue, type)
  }
}

export const {
  name: passwordSagaName,
  wrappedSaga: passwordSaga,
  reducer: passwordReducer,
  actions: passwordActions,
} = createMonitoredSaga<PasswordParams>(password, 'password')

function* setPassword(password: string, type: SecretType) {
  if (!isSignerSet()) {
    throw new Error('Account not setup yet')
  }

  yield* call(saveWallet, password)
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
		// TODO
    // yield* call(importWallet, { mnemonic, derivationPath })
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

function* changePassword(existingPass: string, newPass: string, type: SecretType) {
  if (!isSignerSet()) {
    throw new Error('Account not setup yet')
  }

  const mnemonic = yield* call(loadWallet, existingPass)
  if (!mnemonic) {
    throw new Error(`Incorrect ${secretTypeToLabel(type)[0]} or missing wallet`)
  }

  yield* call(saveWallet, newPass, true)
  yield* put(setSecretType(type))
  yield* put(setWalletUnlocked(true))

  updateUnlockedTime()
  logger.info(`${type} changed`)
}
