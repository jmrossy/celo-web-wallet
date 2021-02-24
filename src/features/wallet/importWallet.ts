import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { Wallet } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { setBackupReminderDismissed } from 'src/features/settings/settingsSlice'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { isValidDerivationPath, isValidMnemonic } from 'src/features/wallet/utils'
import { setAddress } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export interface ImportWalletParams {
  mnemonic: string
  derivationPath?: string
}

export function validate(params: ImportWalletParams): ErrorState {
  const { mnemonic, derivationPath } = params

  if (!isValidMnemonic(mnemonic)) {
    return invalidInput('mnemonic', 'Invalid account key')
  }

  if (derivationPath && !isValidDerivationPath(derivationPath)) {
    return invalidInput('index', 'Invalid derivation path')
  }

  return { isValid: true }
}

export function* importWallet(params: ImportWalletParams) {
  validateOrThrow(() => validate(params), 'Invalid import values')

  const { mnemonic, derivationPath: _derivationPath } = params
  const derivationPath = _derivationPath ?? CELO_DERIVATION_PATH + '/0'

  const provider = getProvider()
  const wallet = Wallet.fromMnemonic(mnemonic.trim(), derivationPath)
  const celoWallet = new CeloWallet(wallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })

  yield* call(onWalletImport, celoWallet.address, SignerType.Local, derivationPath)
}

export function* onWalletImport(newAddress: string, type: SignerType, derivationPath: string) {
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  yield* put(setAddress({ address: newAddress, type, derivationPath }))
  yield* put(setBackupReminderDismissed(true)) // Dismiss reminder about account key backup
  yield* put(fetchBalancesActions.trigger())

  // Only want to clear the feed if its not from the persisted/current wallet
  if (!currentAddress || currentAddress !== newAddress) {
    logger.warn('New address does not match current one in store')
    yield* put(resetFeed())
  }
  yield* put(fetchFeedActions.trigger())
}

export const {
  name: importWalletSagaName,
  wrappedSaga: importWalletSaga,
  actions: importWalletActions,
  reducer: importWalletReducer,
} = createMonitoredSaga<ImportWalletParams>(importWallet, 'importWallet')

// Used for better dev experience, do not used in production
export function* importDefaultAccount() {
  if (!config.defaultAccount) return
  yield* call(importWallet, { mnemonic: config.defaultAccount })
}
