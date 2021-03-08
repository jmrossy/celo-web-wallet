/**
 * Utilities to faciliate sending transactions with
 * different gas currencies. Prefer these to
 * sending with Ethers directly.
 */

import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { getProvider } from 'src/blockchain/provider'
import { getSigner } from 'src/blockchain/signer'
import { CELO } from 'src/currency'
import { FeeEstimate } from 'src/features/fees/types'

export async function sendTransaction(tx: CeloTransactionRequest, feeEstimate?: FeeEstimate) {
  const signedTx = await signTransaction(tx, feeEstimate)
  return sendSignedTransaction(signedTx)
}

export async function signTransaction(tx: CeloTransactionRequest, feeEstimate?: FeeEstimate) {
  const signer = getSigner().signer

  if (!feeEstimate) {
    // For now, require fee to be pre-computed when using this utility
    // May revisit later
    throw new Error('Fee estimate required to send tx')
  }

  const { gasPrice, gasLimit, token } = feeEstimate
  const feeCurrencyAddress = token.id === CELO.id ? undefined : token.contractAddress

  const signedTx = await signer.signTransaction({
    ...tx,
    // TODO set gatewayFeeRecipient
    gasPrice: BigNumber.from(gasPrice),
    gasLimit: BigNumber.from(gasLimit),
    feeCurrency: feeCurrencyAddress,
  })

  return signedTx
}

export async function sendSignedTransaction(signedTx: string) {
  const provider = getProvider()
  const txResponse = await provider.sendTransaction(signedTx)
  const txReceipt = await txResponse.wait()
  return txReceipt
}

export async function getCurrentNonce() {
  const signer = getSigner().signer
  const nonce = await signer.getTransactionCount('pending')
  return BigNumber.from(nonce).toNumber()
}
