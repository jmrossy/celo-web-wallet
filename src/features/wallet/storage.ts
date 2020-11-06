import { getSigner } from 'src/blockchain/signer'
import { decryptMnemonic, encryptMnemonic } from 'src/features/wallet/encryption'
import { importWallet } from 'src/features/wallet/importWallet'
import { logger } from 'src/utils/logger'
import { createSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

const MNEMONIC_STORAGE_KEY = 'wallet/mnemonic'

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

    // TODO warn safari users of apple's bullshit
    localStorage.setItem(MNEMONIC_STORAGE_KEY, encryptedMnemonic)
  } catch (error) {
    logger.error('Failed to save wallet to storage', error)
    throw new Error('Failure saving wallet')
  }
}

interface LoadWalletParams {
  pincode: string
  isWalletExpected?: boolean
}

export function* loadWallet({ pincode, isWalletExpected = false }: LoadWalletParams) {
  const mnemonic = yield* call(_loadWallet, pincode)
  if (!mnemonic) {
    if (isWalletExpected) {
      // TODO show  error
    }
    return
  }

  yield* call(importWallet, mnemonic)
}

export const { wrappedSaga: loadWalletSaga, actions: loadWalletActions } = createSaga<
  LoadWalletParams
>(loadWallet, 'loadWallet')

async function _loadWallet(pincode: string) {
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
