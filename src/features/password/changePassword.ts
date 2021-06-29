import { validatePasswordValue } from 'src/features/password/utils'
import { changeWalletPassword } from 'src/features/wallet/manager'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call } from 'typed-redux-saga'

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
  validateOrThrow(() => validate(params), 'Invalid Password')

  const { value, newValue } = params
  yield* call(changeWalletPassword, value, newValue)

  logger.info('password changed')
}

export const {
  name: changePasswordSagaName,
  wrappedSaga: changePasswordSaga,
  reducer: changePasswordReducer,
  actions: changePasswordActions,
} = createMonitoredSaga<ChangePasswordParams>(changePassword, 'changePassword')
