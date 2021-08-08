import { MAX_ACCOUNT_NAME_LENGTH } from 'src/consts'
import { removeAccount, renameAccount } from 'src/features/wallet/manager'
import { isValidAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call } from 'typed-redux-saga'

export enum EditAccountAction {
  Rename,
  Remove,
}

export interface EditAccountParams {
  address: string
  action: EditAccountAction
  newName?: string
}

function validate(params: EditAccountParams): ErrorState {
  const { address, action, newName } = params
  if (!address) return invalidInput('address', 'Address is required')
  if (!isValidAddress(address)) return invalidInput('address', 'Address is invalid')
  if (!Object.values(EditAccountAction).includes(action))
    return invalidInput('action', 'Invalid edit action')
  if (action === EditAccountAction.Rename) {
    if (!newName) return invalidInput('newName', 'New name is required')
    if (newName.length > MAX_ACCOUNT_NAME_LENGTH)
      return invalidInput('newName', 'New name is too long')
  }
  return { isValid: true }
}

function* editAccount(params: EditAccountParams) {
  validateOrThrow(() => validate(params), 'Invalid switch account parameters')

  const { address, action, newName } = params
  if (action === EditAccountAction.Rename) {
    renameAccount(address, newName!)
    logger.info('Account renamed successfully')
  } else if (action === EditAccountAction.Remove) {
    yield* call(removeAccount, address)
    logger.info('Account removed successfully')
  }
}

export const {
  name: editAccountSagaName,
  wrappedSaga: editAccountSaga,
  reducer: editAccountReducer,
  actions: editAccountActions,
} = createMonitoredSaga<EditAccountParams>(editAccount, 'editAccount')
