import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { addAccount } from 'src/features/wallet/manager'
import {
  isValidDerivationPath,
  isValidMnemonic,
  isValidMnemonicLocale,
} from 'src/features/wallet/utils'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, select } from 'typed-redux-saga'

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
  const defaultDerivationPath = CELO_DERIVATION_PATH + '/0'
  yield* call(addAccount, {
    type: SignerType.Local,
    mnemonic: params.mnemonic,
    derivationPath: params.derivationPath || defaultDerivationPath,
    locale: params.locale,
    password: params.password,
  })
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
