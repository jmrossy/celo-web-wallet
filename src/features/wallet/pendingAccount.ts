import { Wallet } from 'ethers'
import { createRandomAccount } from 'src/features/wallet/manager'
import { normalizeMnemonic } from 'src/features/wallet/utils'
import { logger } from 'src/utils/logger'

// Used to temporarily hold keys for flows where
// account creation/import is separate step than password set
// For security, prefer to store them here instead of nav state or redux
// Note: ethers calls type 'wallet' but it's more of an account
export interface PendingAccount {
  wallet: Wallet
  isImported: boolean
}

let pendingAccount: PendingAccount | null = null

export function setPendingAccount(mnemonic: string, derivationPath: string, isImported = true) {
  if (pendingAccount) logger.warn('Overwriting existing pending account')
  const formattedMnemonic = normalizeMnemonic(mnemonic)
  pendingAccount = { wallet: Wallet.fromMnemonic(formattedMnemonic, derivationPath), isImported }
}

export function createPendingAccount() {
  if (pendingAccount) logger.warn('Overwriting existing pending account')
  const wallet = createRandomAccount()
  pendingAccount = { wallet, isImported: false }
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic.phrase,
    derivationPath: wallet.mnemonic.path,
  }
}

export function getPendingAccount() {
  const pending = pendingAccount
  // Auto-clear it after first read
  pendingAccount = null
  return pending
}
