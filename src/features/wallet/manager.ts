import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { utils, Wallet } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { getSigner, setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { LedgerSigner } from 'src/features/ledger/LedgerSigner'
import { createLedgerSigner } from 'src/features/ledger/signerFactory'
import {
  getPasswordCache,
  hasPasswordCached,
  setPasswordCache,
} from 'src/features/password/password'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { decryptMnemonic, encryptMnemonic } from 'src/features/wallet/encryption'
import {
  addAccount as addAccountToStorage,
  getAccounts as getAccountsFromStorage,
  StoredAccountData,
} from 'src/features/wallet/storage'
import { isValidMnemonic, normalizeMnemonic } from 'src/features/wallet/utils'
import { setAccount } from 'src/features/wallet/walletSlice'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { call, put, select } from 'typed-redux-saga'

export interface LocalAccount {
  type: SignerType.Local
  mnemonic: string
  derivationPath: string
  locale?: string
  name?: string
}

export interface LedgerAccount {
  type: SignerType.Ledger
  derivationPath: string
  address?: string
  name?: string
}

const accountListCache: Map<string, StoredAccountData> = new Map()

export function getAccounts() {
  if (accountListCache.size <= 0) {
    const storedAccounts = getAccountsFromStorage()
    for (const a of storedAccounts) {
      accountListCache.set(a.address, a)
    }
  }
  return accountListCache
}

export function hasAccounts() {
  return getAccounts().size !== 0
}

// Does the wallet have any encrypted local accounts
// I.e. has the user ever set a password
export function hasPasswordedAccount() {
  const accounts = getAccounts().values()
  for (const account of accounts) {
    if (account.type === SignerType.Local && account.encryptedMnemonic) return true
  }
  return false
}

export function getDefaultNewAccountName() {
  return `Account ${getAccounts().size + 1}`
}

export function* loadAccount(address: string, password?: string) {
  const accounts = getAccounts()
  const activeAccount = accounts.get(address)
  if (!activeAccount) throw new Error(`No account found with address ${address}`)

  if (activeAccount.type === SignerType.Local) {
    yield* call(loadLocalAccount, activeAccount, password)
  } else if (activeAccount.type === SignerType.Ledger) {
    yield* call(loadLedgerAccount, activeAccount)
  } else {
    throw new Error('Invalid account signer type')
  }
}

function* loadLocalAccount(account: StoredAccountData, password?: string) {
  if (!password) {
    const cachedPassword = getPasswordCache()
    if (cachedPassword) password = cachedPassword.password
    else throw new Error('Must unlock account with password before importing')
  }

  const { encryptedMnemonic, derivationPath } = account
  if (!password) throw new Error('Password required for local accounts')
  if (!encryptedMnemonic) throw new Error('Expected local account to have mnemonic')
  const mnemonic = yield* call(decryptMnemonic, encryptedMnemonic, password)

  const wallet = Wallet.fromMnemonic(mnemonic, derivationPath)
  if (!areAddressesEqual(wallet.address, account.address))
    throw new Error('Address from menmonic does not match desired address')

  if (!hasPasswordCached()) setPasswordCache(password)
  yield* call(activateLocalAccount, wallet)
}

function* loadLedgerAccount(account: StoredAccountData) {
  const { address, derivationPath } = account
  const provider = getProvider()
  const ledgerSigner = yield* call(createLedgerSigner, derivationPath, provider)
  yield* call(activateLedgerAccount, ledgerSigner, address)
}

export function createRandomAccount() {
  const entropy = utils.randomBytes(32)
  const mnemonic = utils.entropyToMnemonic(entropy)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  return Wallet.fromMnemonic(mnemonic, derivationPath)
}

export function* addAccount(newAccount: LocalAccount | LedgerAccount, password?: string) {
  if (newAccount.type === SignerType.Local) {
    yield* call(addLocalAccount, newAccount, password)
  } else if (newAccount.type === SignerType.Ledger) {
    yield* call(addLedgerAccount, newAccount)
  } else {
    throw new Error('Invalid new account type')
  }
}

function* addLocalAccount(newAccount: LocalAccount, password?: string) {
  if (!password) {
    const cachedPassword = getPasswordCache()
    if (cachedPassword) password = cachedPassword.password
    else throw new Error('Must unlock account with password before importing')
  } else {
    yield* call(verifyPassword, password)
    setPasswordCache(password)
  }

  const { mnemonic, derivationPath, locale } = newAccount
  const formattedMnemonic = normalizeMnemonic(mnemonic)
  const encryptedMnemonic = yield* call(encryptMnemonic, formattedMnemonic, password)
  const wallet = Wallet.fromMnemonic(formattedMnemonic, derivationPath)
  const name = newAccount.name || getDefaultNewAccountName()
  const storedAccount: StoredAccountData = {
    type: SignerType.Local,
    address: wallet.address,
    name,
    derivationPath,
    locale,
    encryptedMnemonic,
  }

  addAccountToStorage(storedAccount)
  accountListCache.set(storedAccount.address, storedAccount)
  yield* call(activateLocalAccount, wallet)
}

function* addLedgerAccount(newAccount: LedgerAccount) {
  const provider = getProvider()
  const ledgerSigner = yield* call(createLedgerSigner, newAccount.derivationPath, provider)
  const address = ledgerSigner.address
  if (!address) throw new Error('LedgerSigner not properly initialized')
  const name = newAccount.name || getDefaultNewAccountName()
  const storedAccount = {
    ...newAccount,
    address,
    name,
  }
  addAccountToStorage(storedAccount)
  accountListCache.set(storedAccount.address, storedAccount)
  yield* call(activateLedgerAccount, ledgerSigner)
}

function* activateLocalAccount(ethersWallet: Wallet) {
  const provider = getProvider()
  const celoWallet = new CeloWallet(ethersWallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })
  yield* call(onAccountActivation, celoWallet.address, SignerType.Local)
}

function* activateLedgerAccount(signer: LedgerSigner, accountAddress?: string) {
  const signerAddress = signer.address
  if (!signerAddress) throw new Error('LedgerSigner not properly initialized')
  if (accountAddress && !areAddressesEqual(signerAddress, accountAddress)) {
    throw new Error('Address mismatch, account may be on a different Ledger')
  }
  setSigner({ signer, type: SignerType.Ledger })
  yield* call(onAccountActivation, signerAddress, SignerType.Ledger)
}

function* onAccountActivation(address: string, type: SignerType) {
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  yield* put(setAccount({ address, type }))
  yield* put(fetchBalancesActions.trigger())

  if (currentAddress && !areAddressesEqual(currentAddress, address)) {
    logger.debug('New address does not match current one in store')
    //TODO load in feed data
    yield* put(resetFeed())
  }

  yield* put(fetchFeedActions.trigger())
}

export function* removeAccount(address: string) {
  //TODO
}

export function renameAccount(address: string, newName: string) {
  // TODO
}

export function getActiveAccount() {
  const signer = getSigner()
  const address = signer.signer.address
  if (!address)
    throw new Error('Signer address not set, may be a LedgerSigner not properly initialized')
  const mnemonic = signer.type === SignerType.Local ? signer.signer.mnemonic.phrase : undefined
  return { address, mnemonic, type: signer.type }
}

// Verifies that provided password decrypts one of the
// current local accounts (if there are any)
// Otherwise throws error
async function verifyPassword(password: string) {
  const accounts = getAccounts()
  if (accounts.size === 0) return
  for (const acc of accounts.values()) {
    if (acc.type === SignerType.Local && acc.encryptedMnemonic) {
      const mnemonic = await decryptMnemonic(acc.encryptedMnemonic, password)
      if (isValidMnemonic(mnemonic)) return
      else throw new Error('Password is incorrect')
    }
  }
  return
}

export async function changeWalletPassword(oldPassword: string, newPassword: string) {
  await verifyPassword(oldPassword)
  //TODO stuff
  setPasswordCache(newPassword)
}
