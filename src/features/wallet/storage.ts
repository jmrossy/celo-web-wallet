import { utils } from 'ethers'
import { SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { storageProvider } from 'src/features/storage/storageProvider'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'

interface AccountData {
  address: string
  type: SignerType
  derivationPath: string
  // accountContract: {
  //   isRegistered: boolean
  //   voteSignerFor: string | null
  //   lastUpdated: number | null
  // }
  encryptedMnemonic?: string // Only SignerType.local accounts will have this
}
const AccountDataWhitelist = ['address', 'type', 'derivationPath', 'encryptedMnemonic']
type AccountsData = Array<AccountData>

// This lock may not be necessary because storage writes/reads are synchronous
// but adding a simple module-level lock just to be cautious
let accountLock = false

function acquireLock() {
  // Should never happen
  if (accountLock) throw new Error('Account lock already acquired')
  accountLock = true
}

function releaseLock() {
  if (!accountLock) logger.warn('Releasing account lock but it is already released')
  accountLock = false
}

enum AccountFile {
  accounts,
  feedData,
}

const STORAGE_PATHS = Object.freeze({
  browser: {
    [AccountFile.accounts]: 'wallet/accounts',
    [AccountFile.feedData]: 'wallet/feedData',
  },
  electron: {
    [AccountFile.accounts]: 'accounts.json',
    [AccountFile.feedData]: 'feedData.json',
  },
})

function getFilePath(file: AccountFile): string {
  if (config.isElectron) return STORAGE_PATHS.electron[file]
  else return STORAGE_PATHS.browser[file]
}

export function getAccounts() {
  return getAccountsData()
}

export function addAccount(newAccount: AccountData) {
  try {
    acquireLock()

    validateAccount(newAccount)

    const accountsMetadata = getAccountsData()
    if (accountsMetadata.find((a) => areAddressesEqual(a.address, newAccount.address))) {
      throw new Error('New account already exists in account list')
    }

    // For 'local' accounts, include the encrypted mnemonic in the AccountData
    // if (newAccount.type === SignerType.Local) {
    //   if (!mnemonic || !isValidMnemonic(mnemonic) || !password) {
    //     throw new Error('New account mnemonic or password is invalid')
    //   }
    //   const encryptedMnemonic = await encryptMnemonic(mnemonic, password)
    //   newAccount.encryptedMnemonic = encryptedMnemonic
    // }

    accountsMetadata.push(newAccount)
    setAccountsData(accountsMetadata)

    tryPersistBrowserStorage()
  } finally {
    releaseLock()
  }
}

export function removeAccount(address: string) {
  try {
    acquireLock()

    const accountsMetadata = getAccountsData()
    const index = accountsMetadata.findIndex((a) => areAddressesEqual(a.address, address))
    if (index < 0) {
      throw new Error('Address not found in account list')
    }

    accountsMetadata.splice(index, 1)
    setAccountsData(accountsMetadata)
  } finally {
    releaseLock()
  }
}

export function removeAllAccounts() {
  try {
    acquireLock()
    setAccountsData([])
  } finally {
    releaseLock()
  }
}

function getAccountsData() {
  const data = storageProvider.getItem(getFilePath(AccountFile.accounts))
  const parsed = parseAccountsData(data)
  return parsed || []
}

function setAccountsData(accounts: AccountsData) {
  const serialized = JSON.stringify(accounts, AccountDataWhitelist)
  storageProvider.setItem(getFilePath(AccountFile.accounts), serialized, true)
}

// function getAccountKeys() {
//   const data = storageProvider.getItem(getFilePath(AccountFile.keys))
//   const parsed = parseAccountData<AccountKey>(data, AccountDataWhitelist, validateKey)
//   return parsed || []
// }

// function setAccountKeys(keys: AccountKeys) {
//   const serialized = JSON.stringify(keys, accountSerializer(AccountKeyWhitelist))
//   storageProvider.setItem(getFilePath(AccountFile.keys), serialized, true)
// }

// function parseAccountData<T>(
//   data: string | null,
//   propWhitelist: string[],
//   validator: (item: T) => void
// ): Array<T> | null {
//   try {
//     if (!data) return null
//     const parsed = JSON.parse(data, accountSerializer(propWhitelist)) as Array<T>
//     if (!parsed || !Array.isArray(parsed)) throw new Error('Invalid format for account data')
//     parsed.forEach(validator)
//     return parsed
//   } catch (error) {
//     logger.error('Error parsing account data', error)
//     throw new Error('Failed to parse account file')
//   }
// }

function parseAccountsData(data: string | null): AccountsData | null {
  try {
    if (!data) return null
    const parsed = JSON.parse(data) as AccountsData
    if (!parsed || !Array.isArray(parsed)) throw new Error('Invalid format for account data')
    parsed.forEach(validateAccount)
    return parsed
  } catch (error) {
    logger.error('Error parsing account data', error)
    throw new Error('Failed to parse account file')
  }
}

function validateAccount(account: AccountData) {
  const error = (reason: string) => {
    throw new Error(`Invalid format for account: ${reason}`)
  }
  if (!account) error('missing account')
  const { address, type, derivationPath, encryptedMnemonic } = account
  if (!address || !utils.isAddress(address)) error('invalid address')
  if (!type || !Object.values(SignerType).includes(type)) error('invalid signer type')
  if (!derivationPath || !isValidDerivationPath(derivationPath)) error('invalid derivation path')
  if (type === SignerType.Local && !encryptedMnemonic) error('local account is missing mnemonic')
  // TODO cleanup?
  // if (!accountContract) error('missing accountContract')
  // const { isRegistered, voteSignerFor, lastUpdated } = accountContract
  // if (typeof isRegistered !== 'boolean') error('invalid isRegistered value')
  // if (voteSignerFor && !utils.isAddress(voteSignerFor)) error('invalid voteSignerFor')
  // if (lastUpdated && typeof lastUpdated !== 'number') error('invalid lastUpdated')
}

// function validateKey(key: AccountKey) {
//   const error = (reason: string) => {
//     throw new Error(`Invalid format for account key: ${reason}`)
//   }
//   if (!key) error('missing key')
//   const { address, mnemonic, derivationPath } = key
//   if (!address || !utils.isAddress(address)) error('invalid address')
//   if (!mnemonic || !isValidMnemonic(mnemonic)) error('invalid mnemonic')
//   if (!derivationPath || !isValidDerivationPath(derivationPath)) error('invalid derivation path')
// }

function tryPersistBrowserStorage() {
  // Request persistent storage for site
  // This prevents browser from clearing local storage when space runs low. Rare but possible.
  // Not a critical perm (and not supported in safari) so not blocking on this
  if (navigator?.storage?.persist) {
    navigator.storage
      .persist()
      .then((isPersisted) => {
        logger.debug(`Is persisted storage granted: ${isPersisted}`)
      })
      .catch((reason) => {
        logger.error('Error enabling storage persist setting', reason)
      })
  }
}
