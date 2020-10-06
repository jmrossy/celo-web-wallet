import { TransactionResponse } from '@ethersproject/abstract-provider'
import { hexlify } from '@ethersproject/bytes'
import { JsonRpcProvider } from '@ethersproject/providers'
import { parseCeloTransaction } from 'src/ethers/celoTransactions'

export class CeloProvider extends JsonRpcProvider {
  /**
   * Override to parse transaction correctly
   * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts#L1016
   */
  async sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
    // throw new Error('Currently unsupported, use sendTransactionRaw instead')
    await this.getNetwork()
    const signedTx = await Promise.resolve(signedTransaction)
    const hexTx = hexlify(signedTx)
    const tx = parseCeloTransaction(signedTx)
    try {
      const hash = await this.perform('sendTransaction', { signedTransaction: hexTx })
      return this._wrapTransaction(tx, hash)
    } catch (error) {
      error.transaction = tx
      error.transactionHash = tx.hash
      throw error
    }
  }
}
