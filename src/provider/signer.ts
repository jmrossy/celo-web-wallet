import { ethers, Wallet } from 'ethers'
import { CeloWallet } from 'src/ethers/CeloWallet'
import { getProvider } from 'src/provider/provider'
import { logger } from 'src/utils/logger'

let signer: Wallet

export function getSigner() {
  if (!signer) {
    logger.warn('Signer is not yet initialized')
  }
  return signer
}

export function setSigner(_signer: ethers.Wallet) {
  if (!_signer || !_signer._isSigner) {
    logger.error('Signer is invalid')
    return
  }

  signer = new CeloWallet(_signer, getProvider())
  // signer = new Wallet(_signer, getProvider())
  // signer = _signer.connect(getProvider())
  logger.info('Signer is set')
}
