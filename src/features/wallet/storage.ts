import { encryptMnemonic } from 'src/features/wallet/encryption'
import { getSigner } from 'src/provider/signer'
import { logger } from 'src/utils/logger'

export async function saveWallet(pincode: string) {
  try {
    const signer = getSigner()
    if (!signer) {
      throw new Error('No signer found')
    }
    if (!signer.mnemonic) {
      throw new Error('No signer mnemonic found')
    }
    if (!crypto || !crypto.subtle) {
      // TODO pop modal to warn user wallet is burner only?
      throw new Error('Crypto libs not available')
    }
    const mnemonic = signer.mnemonic.phrase
    const encryptedMnemonic = await encryptMnemonic(mnemonic, pincode)

    // TODO save to local storage
  } catch (error) {
    logger.error('Failed to save wallet to storage', error)
    // TODO surface error
  }
}

export async function loadWallet() {
  //TODO
}

export async function removeWallet() {
  //TODO
}
