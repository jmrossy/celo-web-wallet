import { utils } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { getPasswordCache, setPasswordCache } from 'src/features/password/password'
import { addAccount, LedgerAccount, LocalAccount } from 'src/features/wallet/manager'
import {
  isValidDerivationPath,
  isValidMnemonic,
  isValidMnemonicLocale,
} from 'src/features/wallet/utils'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export interface ImportAccountParams {
  account: LocalAccount | LedgerAccount
  password?: string
}

function validate(params: ImportAccountParams): ErrorState {
  const { account } = params
  if (account.type === SignerType.Local) {
    const { mnemonic, derivationPath, locale } = account
    if (!isValidMnemonic(mnemonic)) {
      return invalidInput('mnemonic', 'Invalid account key')
    }
    if (!isValidDerivationPath(derivationPath)) {
      return invalidInput('derivationPath', 'Invalid derivation path')
    }
    if (locale && !isValidMnemonicLocale(locale)) {
      return invalidInput('locale', 'Invalid locale')
    }
  } else if (account.type === SignerType.Ledger) {
    const { address, derivationPath } = account
    if (!utils.isAddress(address)) {
      return invalidInput('address', 'Invalid address')
    }
    if (!isValidDerivationPath(derivationPath)) {
      return invalidInput('derivationPath', 'Invalid derivation path')
    }
  } else {
    return invalidInput('type', 'Invalid signer type')
  }
  return { isValid: true }
}

export function* importAccount(params: ImportAccountParams) {
  validateOrThrow(() => validate(params), 'Invalid import values')

  const { account, password } = params
  if (account.type === SignerType.Local) {
    yield* call(importLocalAccount, account, password)
  } else if (account.type === SignerType.Ledger) {
    yield* call(importLedgerAccount, account)
  }

  yield* put(setWalletUnlocked(true))
  logger.info('Account imported successfully')
}

function* importLocalAccount(account: LocalAccount, password?: string) {
  const { mnemonic, derivationPath: _derivationPath, locale } = account
  const derivationPath = _derivationPath || CELO_DERIVATION_PATH + '/0'

  if (password) {
    setPasswordCache(password)
  } else {
    const cachedPassword = getPasswordCache()
    if (cachedPassword) password = cachedPassword.password
    else throw new Error('Must unlock account with password before importing')
  }

  yield* call(
    addAccount,
    {
      type: SignerType.Local,
      mnemonic,
      derivationPath,
      locale,
    },
    password
  )
}

function* importLedgerAccount(account: LedgerAccount) {
  const { address, derivationPath } = account
  yield* call(addAccount, {
    type: SignerType.Ledger,
    address,
    derivationPath,
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
