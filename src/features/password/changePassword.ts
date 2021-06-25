import { validatePasswordValue } from 'src/features/password/utils'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { put } from 'typed-redux-saga'

export interface ChangePasswordParams {
  value: string
  valueConfirm: string
  newValue: string
}

export function validate(params: ChangePasswordParams): ErrorState {
  const { value, newValue, valueConfirm } = params

  let errors: ErrorState = { isValid: true }

  if (!value) {
    return invalidInput('value', 'Value is required')
  }
  if (!newValue) {
    return invalidInput('newValue', 'New value is required')
  }
  if (newValue === value) {
    errors = { ...errors, ...invalidInput('newValue', 'New value is unchanged') }
  } else {
    errors = { ...errors, ...validatePasswordValue(value, 'newValue') }
  }
  if (!valueConfirm) {
    errors = { ...errors, ...invalidInput('valueConfirm', 'Confirm value is required') }
  } else if (newValue !== valueConfirm) {
    errors = { ...errors, ...invalidInput('valueConfirm', 'New values do not match') }
  }

  return errors
}

function* changePassword(params: ChangePasswordParams) {
  validateOrThrow(() => validate(params), 'Invalid Pincode or Password')

  const { value, newValue } = params
  //TODO
  // if (!isSignerSet()) {
  //   throw new Error('Account not setup yet')
  // }

  // const mnemonic = yield* call(loadWallet, existingPass)
  // if (!mnemonic) {
  //   throw new Error(`Incorrect ${secretTypeToLabel(type)[0]} or missing wallet`)
  // }

  // yield* call(saveWallet, newPass, true)
  // yield* put(setSecretType(type))
  yield* put(setWalletUnlocked(true))

  // updateUnlockedTime()
  logger.info('password changed')
}

export const {
  name: changePasswordSagaName,
  wrappedSaga: changePasswordSaga,
  reducer: changePasswordReducer,
  actions: changePasswordActions,
} = createMonitoredSaga<ChangePasswordParams>(changePassword, 'changePassword')
