import { config } from 'src/config'
import { storageProvider } from 'src/features/storage/storageProvider'
import { decryptMnemonic } from 'src/features/wallet/encryption'
import { logger } from 'src/utils/logger'

const MNEMONIC_STORAGE_KEY = 'wallet/mnemonic' // for web
const MNEMONIC_FILENAME = 'mnemonic.enc' // for electron

function getWalletPath() {
  return config.isElectron ? MNEMONIC_FILENAME : MNEMONIC_STORAGE_KEY
}

function isWalletInStorage() {
  return storageProvider.hasItem(getWalletPath())
}

export async function loadWallet(password: string) {
  try {
    const encryptedMnemonic = storageProvider.getItem(getWalletPath())
    if (!encryptedMnemonic) {
      logger.warn('No wallet found in storage')
      return null
    }

    const mnemonic = await decryptMnemonic(encryptedMnemonic, password)
    return mnemonic
  } catch (error) {
    logger.error('Failed to load wallet from storage', error)
    return null
  }
}

export function removeWallet() {
  try {
    if (isWalletInStorage()) storageProvider.removeItem(getWalletPath())
  } catch (error) {
    logger.error('Failed to remove wallet from storage', error)
  }
}
