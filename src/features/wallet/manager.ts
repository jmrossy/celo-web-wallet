import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { utils, Wallet } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { clearContractCache } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { clearSigner, getSigner, setSigner } from 'src/blockchain/signer'
import { SignerType } from 'src/blockchain/types'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { fetchBalancesActions } from 'src/features/balances/fetchBalances'
import { resetFeed, setTransactions } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { LedgerSigner } from 'src/features/ledger/LedgerSigner'
import { createLedgerSigner } from 'src/features/ledger/signerFactory'
import {
  clearPasswordCache,
  getPasswordCache,
  hasPasswordCached,
  setPasswordCache,
} from 'src/features/password/password'
import { resetValidatorForAccount } from 'src/features/validators/validatorsSlice'
import { decryptMnemonic, encryptMnemonic } from 'src/features/wallet/encryption'
import {
  addAccount as addAccountToStorage,
  getAccounts as getAccountsFromStorage,
  getFeedDataForAccount,
  modifyAccounts as modifyAccountsInStorage,
  removeAccount as removeAccountFromStorage,
  removeAllAccounts as removeAllAccountsFromStorage,
  removeAllFeedData,
  removeFeedDataForAccount,
  setFeedDataForAccount,
  StoredAccountData,
} from 'src/features/wallet/storage'
import { isValidMnemonic, normalizeMnemonic } from 'src/features/wallet/utils'
import { resetWallet, setAccount } from 'src/features/wallet/walletSlice'
import { disconnectWcClient, resetWcClient } from 'src/features/walletConnect/walletConnectSlice'
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
  logger.debug('Loading a local account')
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
  logger.debug('Loading a ledger account')
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
  logger.debug('Adding a local account')
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
  logger.debug('Adding a ledger account')
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
  yield* call(activateLedgerAccount, ledgerSigner, newAccount.address)
}

function* activateLocalAccount(ethersWallet: Wallet) {
  const provider = getProvider()
  const celoWallet = new CeloWallet(ethersWallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })
  yield* call(onAccountActivation, celoWallet.address, celoWallet.mnemonic.path, SignerType.Local)
}

function* activateLedgerAccount(signer: LedgerSigner, accountAddress?: string) {
  const signerAddress = signer.address
  if (!signerAddress) throw new Error('LedgerSigner not properly initialized')
  if (accountAddress && !areAddressesEqual(signerAddress, accountAddress)) {
    throw new Error('Address mismatch, account may be on a different Ledger')
  }
  setSigner({ signer, type: SignerType.Ledger })
  yield* call(onAccountActivation, signerAddress, signer.path, SignerType.Ledger)
}

function* onAccountActivation(address: string, derivationPath: string, type: SignerType) {
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  yield* put(setAccount({ address, derivationPath, type }))
  yield* call(loadFeedData, address, currentAddress)

  if (currentAddress && !areAddressesEqual(currentAddress, address)) {
    logger.debug('New address activated, clearing old data')
    clearContractCache()
    yield* put(resetValidatorForAccount())
    yield* put(disconnectWcClient())
    yield* put(resetWcClient())
  }

  yield* put(fetchBalancesActions.trigger())
  yield* put(fetchFeedActions.trigger())
}

export function renameAccount(address: string, newName: string) {
  const accountData = accountListCache.get(address)
  if (!accountData) throw new Error(`Account ${address} not found in account list cache`)
  accountData.name = newName
  modifyAccountsInStorage([accountData])
}

export function* removeAccount(address: string) {
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  if (address === currentAddress)
    throw new Error('Cannot remove active account, please switch first.')
  const numAccounts = getAccounts().size
  if (numAccounts === 1) throw new Error('Cannot remove last account. Use logout instead.')
  removeAccountFromStorage(address)
  yield* call(removeFeedDataForAccount, address)
  accountListCache.delete(address)
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
  const accounts = getAccounts()
  if (accounts.size === 0) return
  const updatedAccounts: StoredAccountData[] = []
  for (const account of accounts.values()) {
    if (account.type === SignerType.Local && account.encryptedMnemonic) {
      const mnemonic = await decryptMnemonic(account.encryptedMnemonic, oldPassword)
      if (!isValidMnemonic(mnemonic)) throw new Error('Unable to decrypt with old password')
      const encryptedMnemonic = await encryptMnemonic(mnemonic, newPassword)
      updatedAccounts.push({ ...account, encryptedMnemonic })
    }
  }
  if (!updatedAccounts.length) throw new Error('No local accounts found, password was never set')
  modifyAccountsInStorage(updatedAccounts)
  setPasswordCache(newPassword)
}

export function* removeAllAccounts() {
  yield* call(removeAllFeedData)
  removeAllAccountsFromStorage()
  accountListCache.clear()
  clearContractCache()
  clearSigner()
  clearPasswordCache()
  yield* put(resetWallet())
}

function* loadFeedData(nextAddress: string, currentAddress?: string | null) {
  try {
    // Save current address' data
    if (currentAddress && !areAddressesEqual(nextAddress, currentAddress)) {
      yield* call(saveFeedData, currentAddress)
    }

    // Load data for new active address
    const feedData = yield* call(getFeedDataForAccount, nextAddress)
    if (feedData) {
      logger.debug('Feed data found in storage. Updating feed')
      let maxBlockNumber = 0
      for (const tx of Object.values(feedData)) {
        maxBlockNumber = Math.max(tx.blockNumber, maxBlockNumber)
      }
      yield* put(setTransactions({ txs: feedData, lastBlockNumber: maxBlockNumber }))
    } else {
      logger.debug('No feed data found in storage. Resetting feed')
      yield* put(resetFeed())
    }

    clearV1FeedData()
  } catch (error) {
    // Since feed data is not critical, swallow errors
    logger.error('Error loading feed data. Resetting feed', error)
    yield* put(resetFeed())
  }
}

export function* saveFeedData(currentAddress: string) {
  const transactions = yield* select((s: RootState) => s.feed.transactions)
  if (transactions && Object.keys(transactions).length) {
    yield* call(setFeedDataForAccount, currentAddress, transactions)
  }
}

// Not essential just a bit of cleanup
// Since feed data is no longer stored in localstorage
// remove it to free up that space
// TODO: Can be safely removed after roughly 2021/09/01
function clearV1FeedData() {
  try {
    localStorage && localStorage.removeItem('persist:feed')
  } catch (error) {
    logger.warn('Error when removing v1 feed data, not critical')
  }
}
