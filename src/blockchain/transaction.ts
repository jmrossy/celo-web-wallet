import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { getSigner } from 'src/blockchain/signer'
import { CeloContract, config } from 'src/config'
import { Currency } from 'src/consts'

const STABLE_TOKEN_GAS_MULTIPLIER = 10

/**
 * Utility function to faciliate sending transactions with
 * different gas currencies
 */
export async function sendTransaction(tx: CeloTransactionRequest, feeCurrency?: Currency) {
  const signer = getSigner()

  if (!feeCurrency || feeCurrency === Currency.CELO) {
    const txResponse = await signer.sendTransaction(tx)

    return txResponse.wait()
  } else {
    const stableTokenAddress = config.contractAddresses[CeloContract.StableToken]
    const gasPrice = await signer.getGasPrice(stableTokenAddress)
    const gasLimit = await signer.estimateGas(tx)

    // TODO find a more scientific was to fix the gas estimation issue.
    // Since txs paid with cUSD also involve token transfers, the gas needed
    // is more than what estimateGas returns
    const adjustedGasLimit = gasLimit.mul(STABLE_TOKEN_GAS_MULTIPLIER)

    const txResponse = await signer.sendTransaction({
      ...tx,
      gasPrice,
      gasLimit: adjustedGasLimit,
      feeCurrency: stableTokenAddress,
    })

    return await txResponse.wait()
  }
}
