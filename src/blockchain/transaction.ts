import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/consts'
import { FeeEstimate } from 'src/features/fees/types'

/**
 * Utility function to faciliate sending transactions with
 * different gas currencies
 */
export async function sendTransaction(tx: CeloTransactionRequest, feeEstimate?: FeeEstimate) {
  const signer = getSigner().signer

  if (!feeEstimate) {
    // For now, require fee to be pre-computed when using this utility
    // May revisit later
    throw new Error('Fee estimate required to send tx')
  }

  const { gasPrice, gasLimit, currency } = feeEstimate

  const feeCurrencyAddress =
    currency === Currency.cUSD ? config.contractAddresses[CeloContract.StableToken] : undefined

  const txResponse = await signer.sendTransaction({
    ...tx,
    // TODO set gatewayFeeRecipient
    gasPrice: BigNumber.from(gasPrice),
    gasLimit: BigNumber.from(gasLimit),
    feeCurrency: feeCurrencyAddress,
  })

  return await txResponse.wait()
}
