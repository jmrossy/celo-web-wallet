import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { Wallet } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { setBackupReminderDismissed } from 'src/features/settings/settingsSlice'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import {
  isValidDerivationPath,
  isValidMnemonic,
  isValidMnemonicLocale,
  normalizeMnemonic,
} from 'src/features/wallet/utils'
import { clearWalletCache, setAddress } from 'src/features/wallet/walletSlice'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export interface ImportAccountParams {
  mnemonic: string
  derivationPath?: string | null
  locale?: string
  password?: string
}

function validate(params: ImportAccountParams): ErrorState {
  const { mnemonic, derivationPath, locale } = params

  if (!isValidMnemonic(mnemonic)) {
    return invalidInput('mnemonic', 'Invalid account key')
  }

  if (derivationPath && !isValidDerivationPath(derivationPath)) {
    return invalidInput('index', 'Invalid derivation path')
  }

  if (locale && !isValidMnemonicLocale(locale)) {
    return invalidInput('locale', 'Invalid locale')
  }

  return { isValid: true }
}

export function* importAccount(params: ImportAccountParams) {
  validateOrThrow(() => validate(params), 'Invalid import values')

  const { mnemonic, derivationPath: _derivationPath } = params
  const formattedMnemonic = normalizeMnemonic(mnemonic)
  const derivationPath = _derivationPath ?? CELO_DERIVATION_PATH + '/0'

  const provider = getProvider()
  const wallet = Wallet.fromMnemonic(formattedMnemonic, derivationPath)
  const celoWallet = new CeloWallet(wallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })

  yield* call(onAccountImport, celoWallet.address, SignerType.Local, derivationPath)
}

export function* onAccountImport(newAddress: string, type: SignerType, derivationPath: string) {
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)

  yield* put(setAddress({ address: newAddress, type, derivationPath }))
  yield* put(setBackupReminderDismissed(true)) // Dismiss reminder about account key backup
  yield* put(fetchBalancesActions.trigger())

  if (currentAddress && !areAddressesEqual(currentAddress, newAddress)) {
    logger.debug('New address does not match current one in store')
    yield* put(clearWalletCache())
    yield* put(resetFeed())
  }
  yield* put(fetchFeedActions.trigger())
}

export const {
  name: importAccountSagaName,
  wrappedSaga: importAccountSaga,
  actions: importAccountActions,
  reducer: importAccountReducer,
} = createMonitoredSaga<ImportAccountParams>(importAccount, 'importAccount')

// Used for better dev experience, do not used in production
export function* importDefaultAccount() {
  if (!config.defaultAccount) return
  // TODO Fix later
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  // yield* call(importWallet, { mnemonic: config.defaultAccount })
}
