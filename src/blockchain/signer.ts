import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { Wallet } from 'ethers'
import { getProvider } from 'src/blockchain/provider'
import { logger } from 'src/utils/logger'

let signer: CeloWallet

export function getSigner() {
  if (!signer) {
    logger.warn('Signer is not yet initialized')
  }
  return signer
}

export function setSigner(_signer: Wallet) {
  if (!_signer || !_signer._isSigner) {
    logger.error('Signer is invalid')
    return
  }

  signer = new CeloWallet(_signer, getProvider())
  logger.info('Signer is set')
}
