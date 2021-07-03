import { isProviderSet } from 'src/blockchain/provider'
import { CeloSigner, SignerType } from 'src/blockchain/types'
import { logger } from 'src/utils/logger'

// Note this is the wallet's local signer, not to be confused with
// vote signers in the Accounts contract
let signer: CeloSigner | undefined

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

export function isSignerLedger() {
  const signer = getSigner()
  return signer.type === SignerType.Ledger
}

export function setSigner(_signer: CeloSigner) {
  if (!_signer || !_signer.signer || !_signer.type) {
    throw new Error('Signer is invalid')
  }

  if (!isProviderSet()) {
    throw new Error('Provider must be set before signer')
  }

  if (signer) {
    logger.debug('Signer is being overridden')
  }

  signer = _signer
  logger.info('Signer is set')
}

export function clearSigner() {
  signer = undefined
}
