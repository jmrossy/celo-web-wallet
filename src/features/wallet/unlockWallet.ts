import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/types'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { setBackupReminderDismissed } from 'src/features/settings/settingsSlice'
import { addAccount, hasAccounts, loadAccount } from 'src/features/wallet/manager'
import { hasAccount_v1, loadWallet_v1 } from 'src/features/wallet/storage_v1'
import { isValidAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export interface UnlockWalletParams {
  activeAddress: string
  type: SignerType
  password?: string
}

export function validate(params: UnlockWalletParams): ErrorState {
  const { activeAddress, type, password } = params
  if (activeAddress && !isValidAddress(activeAddress))
    return invalidInput('address', 'Address is invalid')
  if (type === SignerType.Local && !password)
    return invalidInput('password', 'Password is required')
  return { isValid: true }
}

function* unlockWallet(params: UnlockWalletParams) {
  validateOrThrow(() => validate(params), 'Invalid unlock parameters')

  // TODO check to nuke account after 15 tries

  if (hasAccounts()) {
    // If accounts already set up, unlock wallet normally
    yield* call(loadAccount, params.activeAddress, params.password)
  } else {
    // Otherwise handle migration of v1 accounts
    yield* call(migrateV1Account, params)
  }

  logger.info('Account unlocked successfully')
}

function* migrateV1Account(params: UnlockWalletParams) {
  logger.info('No accounts found, checking if v1 account should be migrated')

  const { address, derivationPath, type } = yield* select((s: RootState) => s.wallet)

  if (hasAccount_v1()) {
    logger.info('v1 account found in storage')
    // Migrate a local account
    if (!params.password) throw new Error('Password required to unlock')
    const mnemonic = yield* call(loadWallet_v1, params.password)
    // Note in rare case where redux state was lost and user used a diff path than default
    // This would lead to migrating a different account. Accepting tradeoff for now.
    const path = derivationPath || CELO_DERIVATION_PATH + '/0'
    yield* call(
      addAccount,
      { type: SignerType.Local, mnemonic, derivationPath: path },
      params.password
    )
    yield* put(setBackupReminderDismissed(true))
    logger.info('Migrated v1 local account')
  } else if (type === SignerType.Ledger) {
    logger.info('Checking for v1 ledger account')
    // Migrate a ledger account
    if (!address || !derivationPath)
      throw new Error('Wallet state is corrupted, please logout and re-import your Ledger account.')
    yield* call(addAccount, { type: SignerType.Ledger, address, derivationPath })
    yield* put(setBackupReminderDismissed(true))
    logger.info('Migrated v1 ledger account')
  } else {
    // Should never happen
    throw new Error('Wallet state is corrupted')
  }
}

export const {
  name: unlockWalletSagaName,
  wrappedSaga: unlockWalletSaga,
  reducer: unlockWalletReducer,
  actions: unlockWalletActions,
} = createMonitoredSaga<UnlockWalletParams>(unlockWallet, 'unlockWallet')
