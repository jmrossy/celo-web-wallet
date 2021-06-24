import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { Wallet } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { getSigner, setSigner, SignerType } from 'src/blockchain/signer'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { encryptMnemonic } from 'src/features/wallet/encryption'
import {
  addAccount as addAccountToStorage,
  getAccounts as getAccountsFromStorage,
  StoredAccountData,
} from 'src/features/wallet/storage'
import { normalizeMnemonic } from 'src/features/wallet/utils'
import { clearWalletCache, setAddress } from 'src/features/wallet/walletSlice'
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

export function* addAccount(newAccount: LocalAccount | LedgerAccount) {
  let storedAccount: StoredAccountData
  if (newAccount.type === SignerType.Local) {
    const { mnemonic, derivationPath, locale } = newAccount
    const formattedMnemonic = normalizeMnemonic(mnemonic)
    const wallet = Wallet.fromMnemonic(formattedMnemonic, derivationPath)
    const password = getWalletPassword(newAccount)
    const encryptedMnemonic = yield* call(encryptMnemonic, formattedMnemonic, password)
    storedAccount = {
      type: SignerType.Local,
      address: wallet.address,
      derivationPath,
      locale,
      encryptedMnemonic,
    }
  } else if (newAccount.type === SignerType.Ledger) {
    storedAccount = newAccount
  } else {
    throw new Error(`Invalid new account type`)
  }

  // Store the new account
  addAccountToStorage(storedAccount)

  // Update the account list cache
  accountListCache.set(storedAccount.address, storedAccount)

  // Switch to that new account to activate it
  yield* call(switchToAccount)
}

export function* switchToAccount(address: string) {
  //TODO
}

function* activateLocalAccount(ethersWallet: Wallet) {
  const provider = getProvider()
  const celoWallet = new CeloWallet(ethersWallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)

  yield* put(setAddress({ address, type, derivationPath }))
  yield* put(fetchBalancesActions.trigger())

  if (currentAddress && !areAddressesEqual(currentAddress, address)) {
    logger.debug('New address does not match current one in store')
    yield* put(clearWalletCache())
    yield* put(resetFeed())
  }
  yield* put(fetchFeedActions.trigger())
}

function activateLedgerAccount() {
  //TODO
}

export function* removeAccount(address: string) {
  //TODO
}

export function getActiveAccount() {
  // TODO
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
