import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { Wallet } from 'ethers'
import { getProvider } from 'src/blockchain/provider'
import { logger } from 'src/utils/logger'

let signer: CeloWallet

export function isSignerSet() {
  return !!signer
}

export function getSigner() {
  if (!signer) {
    logger.error('Signer is not yet initialized')
    throw new Error('Attempting to use signer before initialized')
  }
  return signer
}

export function setSigner(_signer: Wallet) {
  if (!_signer || !_signer._isSigner) {
    throw new Error('Signer is invalid')
  }

  if (signer) {
    logger.warn('Signer is being overridden')
  }

  const provider = getProvider()
  if (!provider) {
    throw new Error('Provider must be set before signer')
  }

  signer = new CeloWallet(_signer, getProvider())
  logger.info('Signer is set')
}
