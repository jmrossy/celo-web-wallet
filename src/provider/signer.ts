import { ethers } from 'ethers'
import { getProvider } from 'src/provider/provider'
import { logger } from 'src/utils/logger'

let signer: ethers.Wallet

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

  signer = _signer.connect(getProvider())
}
