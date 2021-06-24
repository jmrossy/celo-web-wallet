import { utils, Wallet } from 'ethers'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { normalizeMnemonic } from 'src/features/wallet/utils'
import { logger } from 'src/utils/logger'

// Used to temporarily hold keys for flows where
// account creation/import is separate step than password set
// For security, prefer to store them here instead of nav state or redux
// Note: ethers calls type 'wallet' but it's more of an account
let pendingAccount: Wallet | null = null

export function setPendingAccount(mnemonic: string, derivationPath: string) {
  if (pendingAccount) logger.warn('Overwriting existing pending account')
  const formattedMnemonic = normalizeMnemonic(mnemonic)
  pendingAccount = Wallet.fromMnemonic(formattedMnemonic, derivationPath)
}

export function createPendingAccount() {
  if (pendingAccount) logger.warn('Overwriting existing pending account')
  const entropy = utils.randomBytes(32)
  const mnemonic = utils.entropyToMnemonic(entropy)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  pendingAccount = Wallet.fromMnemonic(mnemonic, derivationPath)
  return {
    address: pendingAccount.address,
    mnemonic: pendingAccount.mnemonic.phrase,
    derivationPath,
  }
}

export function getPendingAccount() {
  const pending = pendingAccount
  // Cached pending account can only be retrieved once
  pendingAccount = null
  return pending
}
