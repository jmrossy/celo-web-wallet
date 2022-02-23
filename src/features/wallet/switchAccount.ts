import { loadAccount } from 'src/features/wallet/manager'
import { isValidAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, delay } from 'typed-redux-saga'

export interface SwitchAccountParams {
  toAddress: Address
  password?: string
}

function validate(params: SwitchAccountParams): ErrorState {
  const { toAddress } = params
  if (!toAddress) return invalidInput('address', 'Address is required')
  if (!isValidAddress(toAddress)) return invalidInput('address', 'Address is invalid')
  return { isValid: true }
}

function* switchAccount(params: SwitchAccountParams) {
  validateOrThrow(() => validate(params), 'Invalid switch account parameters')

  const { toAddress, password } = params
  yield* call(loadAccount, toAddress, password)

  logger.info('Account switched successfully')

  // Delay b.c. spinner shows for too short a time, feels jarring
  // Also gives time for fetch balance get a head start
  yield* delay(1000) // 1 second
}

export const {
  name: switchAccountSagaName,
  wrappedSaga: switchAccountSaga,
  reducer: switchAccountReducer,
  actions: switchAccountActions,
} = createMonitoredSaga<SwitchAccountParams>(switchAccount, 'switchAccount')
