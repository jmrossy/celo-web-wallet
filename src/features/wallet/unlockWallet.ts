import { utils } from 'ethers'
import { setPasswordCache } from 'src/features/password/password'
import { loadAccount } from 'src/features/wallet/manager'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export interface UnlockWalletParams {
  activeAddress: string
  password?: string
}

export function validate(params: UnlockWalletParams): ErrorState {
  const { activeAddress } = params
  if (!activeAddress) return invalidInput('address', 'Address is required')
  if (!utils.isAddress(activeAddress)) return invalidInput('address', 'Address is invalid')
  return { isValid: true }
}

function* unlockWallet(params: UnlockWalletParams) {
  validateOrThrow(() => validate(params), 'Invalid Pincode or Password')

  const { activeAddress, password } = params
  yield* call(loadAccount, activeAddress, password)

  if (password) setPasswordCache(password)
  yield* put(setWalletUnlocked(true))
  logger.info('Account unlocked successfully')
}

export const {
  name: unlockWalletSagaName,
  wrappedSaga: unlockWalletSaga,
  reducer: unlockWalletReducer,
  actions: unlockWalletActions,
} = createMonitoredSaga<UnlockWalletParams>(unlockWallet, 'unlockWallet')
