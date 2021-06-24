import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { utils, Wallet } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { getSigner, setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { createLedgerSigner } from 'src/features/ledger/signerFactory'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { encryptMnemonic } from 'src/features/wallet/encryption'
import {
  addAccount as addAccountToStorage,
  getAccounts as getAccountsFromStorage,
  StoredAccountData,
} from 'src/features/wallet/storage'
import { normalizeMnemonic } from 'src/features/wallet/utils'
import { setAccount } from 'src/features/wallet/walletSlice'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { call, put, select } from 'typed-redux-saga'

interface LocalAccount {
  type: SignerType.Local
  mnemonic: string
  derivationPath: string
  locale?: string
  password?: string
}

interface LedgerAccount {
  type: SignerType.Ledger
  address: string
  derivationPath: string
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

export function createRandomAccount() {
  const entropy = utils.randomBytes(32)
  const mnemonic = utils.entropyToMnemonic(entropy)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  return Wallet.fromMnemonic(mnemonic, derivationPath)
}

export function* addAccount(newAccount: LocalAccount | LedgerAccount) {
  if (newAccount.type === SignerType.Local) {
    const { mnemonic, derivationPath, locale } = newAccount

    const password = getWalletPassword(newAccount)
    const formattedMnemonic = normalizeMnemonic(mnemonic)
    const encryptedMnemonic = yield* call(encryptMnemonic, formattedMnemonic, password)
    const wallet = Wallet.fromMnemonic(formattedMnemonic, derivationPath)
    const storedAccount: StoredAccountData = {
      type: SignerType.Local,
      address: wallet.address,
      derivationPath,
      locale,
      encryptedMnemonic,
    }

    addAccountToStorage(storedAccount)
    accountListCache.set(storedAccount.address, storedAccount)
    yield* call(activateLocalAccount, wallet)
  } else if (newAccount.type === SignerType.Ledger) {
    addAccountToStorage(newAccount)
    accountListCache.set(newAccount.address, newAccount)
    yield* call(activateLedgerAccount, newAccount)
  } else {
    throw new Error('Invalid new account type')
  }
}

export function* switchToAccount(address: string) {
  //TODO
}

function* activateLocalAccount(ethersWallet: Wallet) {
  const provider = getProvider()
  const celoWallet = new CeloWallet(ethersWallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })
  yield* call(onAccountActivation, celoWallet.address, SignerType.Local)
}

function* activateLedgerAccount(account: LedgerAccount) {
  const provider = getProvider()
  const ledgerSigner = yield* call(createLedgerSigner, account.derivationPath, provider)
  const address = ledgerSigner.address
  if (!address || !areAddressesEqual(address, account.address)) {
    throw new Error('Address mismatch, account may be on a different Ledger')
  }
  setSigner({ signer: ledgerSigner, type: SignerType.Ledger })
  yield* call(onAccountActivation, address, SignerType.Ledger)
}

function* onAccountActivation(address: string, type: SignerType) {
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  yield* put(setAccount({ address, type }))
  yield* put(fetchBalancesActions.trigger())

  if (currentAddress && !areAddressesEqual(currentAddress, address)) {
    logger.debug('New address does not match current one in store')
    // yield* put(clearWalletCache())
    yield* put(resetFeed())
  }
  yield* put(fetchFeedActions.trigger())
}

export function* removeAccount(address: string) {
  //TODO
}

export function getActiveAccount() {
  const signer = getSigner()
  const address = signer.signer.address
  if (!address)
    throw new Error('Signer address not set, may be a LedgerSigner not properly initialized')
  const mnemonic = signer.type === SignerType.Local ? signer.signer.mnemonic.phrase : undefined
  return { address, mnemonic, type: signer.type }
}

function getWalletPassword(newAccount: LocalAccount): string {
  // If the new account included the password
  const newAccountPass = newAccount.password
  if (newAccountPass) return newAccountPass
  // If there's a cached password
  // const cachedPassword = getCachedPassword()
  const cachedPassword = 'TODO'
  if (cachedPassword) return cachedPassword
  // Else throw error, the navigation should not have allowed this
  throw new Error('No password set for wallet')
}
