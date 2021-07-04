// Contains code to interact with the now deprecated single-account storage
// Needs to be kept indefinitely to ensure no old accounts are lost
import { config } from 'src/config'
import { storageProvider } from 'src/features/storage/storageProvider'
import { decryptMnemonic } from 'src/features/wallet/encryption'
import { isValidMnemonic } from 'src/features/wallet/utils'
import { logger } from 'src/utils/logger'

const MNEMONIC_STORAGE_KEY = 'wallet/mnemonic' // for web
const MNEMONIC_FILENAME = 'mnemonic.enc' // for electron

function getWalletPath() {
  return config.isElectron ? MNEMONIC_FILENAME : MNEMONIC_STORAGE_KEY
}

export function hasAccount_v1() {
  return storageProvider.hasItem(getWalletPath())
}

export async function loadWallet_v1(password: string) {
  try {
    const encryptedMnemonic = storageProvider.getItem(getWalletPath())
    if (!encryptedMnemonic) throw new Error('No account key in storage')
    const mnemonic = await decryptMnemonic(encryptedMnemonic, password)
    if (!isValidMnemonic(mnemonic)) throw new Error('Decrypted account key is invalid')
    return mnemonic
  } catch (error) {
    logger.error('Failed to load wallet from storage', error)
    throw new Error('Unable to load wallet from storage')
  }
}

export function removeWallet_v1() {
  try {
    if (hasAccount_v1()) storageProvider.removeItem(getWalletPath())
  } catch (error) {
    logger.error('Failed to remove wallet from storage', error)
  }
}
