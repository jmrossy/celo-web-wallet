import { utils } from 'ethers'
import { loadAccount } from 'src/features/wallet/manager'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call } from 'typed-redux-saga'

export interface SwitchAccountParams {
  toAddress: string
  password?: string
}

function validate(params: SwitchAccountParams): ErrorState {
  const { toAddress } = params
  if (!toAddress) return invalidInput('address', 'Address is required')
  if (!utils.isAddress(toAddress)) return invalidInput('address', 'Address is invalid')
  return { isValid: true }
}

function* switchAccount(params: SwitchAccountParams) {
  validateOrThrow(() => validate(params), 'Invalid switch account parameters')

  const { toAddress, password } = params
  yield* call(loadAccount, toAddress, password)

  logger.info('Account switched successfully')
}

export const {
  name: switchAccountSagaName,
  wrappedSaga: switchAccountSaga,
  reducer: switchAccountReducer,
  actions: switchAccountActions,
} = createMonitoredSaga<SwitchAccountParams>(switchAccount, 'switchAccount')
