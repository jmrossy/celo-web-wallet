import { getSigner, SignerType } from 'src/blockchain/signer'
import { decryptMnemonic, encryptMnemonic } from 'src/features/wallet/encryption'
import { isValidMnemonic } from 'src/features/wallet/importWallet'
import { logger } from 'src/utils/logger'

const MNEMONIC_STORAGE_KEY = 'wallet/mnemonic'

export function isWalletInStorage() {
  return !!localStorage.getItem(MNEMONIC_STORAGE_KEY)
}

export async function saveWallet(pincode: string) {
  try {
    const signer = getSigner()
    if (!signer) throw new Error('No signer found')
    if (signer.type !== SignerType.Local) throw new Error('Attempting to save non-local wallet')

    const mnemonic = signer.signer.mnemonic?.phrase
    if (!mnemonic) throw new Error('No signer mnemonic found')
    if (!isValidMnemonic(mnemonic)) throw new Error('Attempting to save invalid mnemonic')

    const encryptedMnemonic = await encryptMnemonic(mnemonic, pincode)

    // TODO warn safari users of apple's bullshit
    // https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
    localStorage.setItem(MNEMONIC_STORAGE_KEY, encryptedMnemonic)
  } catch (error) {
    logger.error('Failed to save wallet to storage', error)
    throw new Error('Failure saving wallet')
  }
}

export async function loadWallet(pincode: string) {
  try {
    const encryptedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY)
    if (!encryptedMnemonic) {
      logger.warn('No wallet found in storage')
      return null
    }

    const mnemonic = await decryptMnemonic(encryptedMnemonic, pincode)
    return mnemonic
  } catch (error) {
    logger.error('Failed to load wallet from storage', error)
    return null
  }
}

export async function removeWallet() {
  try {
    localStorage.removeItem(MNEMONIC_STORAGE_KEY)
  } catch (error) {
    logger.error('Failed to remove wallet from storage', error)
  }
}
