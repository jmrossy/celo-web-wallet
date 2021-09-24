import { SignerType } from 'src/blockchain/types'
import { MAX_ACCOUNT_NAME_LENGTH } from 'src/consts'
import { setBackupReminderDismissed } from 'src/features/settings/settingsSlice'
import { addAccount, LedgerAccount, LocalAccount } from 'src/features/wallet/manager'
import {
  isValidDerivationPath,
  isValidMnemonic,
  isValidMnemonicLocale,
} from 'src/features/wallet/utils'
import { isValidAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export interface ImportAccountParams {
  account: LocalAccount | LedgerAccount
  password?: string
  isExisting?: boolean // i.e. is not a newly created account
}

function validate(params: ImportAccountParams): ErrorState {
  const { account } = params
  if (account.type === SignerType.Local) {
    const { mnemonic, derivationPath, locale } = account
    if (!isValidMnemonic(mnemonic)) {
      return invalidInput('mnemonic', 'Invalid seed phrase')
    }
    if (!isValidDerivationPath(derivationPath)) {
      return invalidInput('derivationPath', 'Invalid derivation path')
    }
    if (locale && !isValidMnemonicLocale(locale)) {
      return invalidInput('locale', 'Invalid locale')
    }
  } else if (account.type === SignerType.Ledger) {
    const { address, derivationPath } = account
    if (address && !isValidAddress(address)) {
      return invalidInput('address', 'Invalid address')
    }
    if (!isValidDerivationPath(derivationPath)) {
      return invalidInput('derivationPath', 'Invalid derivation path')
    }
  } else {
    return invalidInput('type', 'Invalid signer type')
  }
  if (account.name && account.name.length > MAX_ACCOUNT_NAME_LENGTH) {
    return invalidInput('name', 'Account name too long')
  }
  return { isValid: true }
}

export function* importAccount(params: ImportAccountParams) {
  validateOrThrow(() => validate(params), 'Invalid import values')

  const { account, password, isExisting } = params
  if (account.type === SignerType.Local) {
    yield* call(importLocalAccount, account, password)
  } else if (account.type === SignerType.Ledger) {
    yield* call(importLedgerAccount, account)
  }

  if (isExisting) {
    // No need to show backup reminder banner if account was imported with mnemonic/ledger
    yield* put(setBackupReminderDismissed(true))
  }

  logger.info('Account imported successfully')
}

function* importLocalAccount(account: LocalAccount, password?: string) {
  const { mnemonic, derivationPath, locale, name } = account
  yield* call(
    addAccount,
    {
      type: SignerType.Local,
      mnemonic,
      derivationPath,
      locale,
      name,
    },
    password
  )
}

function* importLedgerAccount(account: LedgerAccount) {
  const { address, derivationPath, name } = account
  yield* call(addAccount, {
    type: SignerType.Ledger,
    address,
    derivationPath,
    name,
  })
}

export const {
  name: importAccountSagaName,
  wrappedSaga: importAccountSaga,
  actions: importAccountActions,
  reducer: importAccountReducer,
} = createMonitoredSaga<ImportAccountParams>(importAccount, 'importAccount')
