import { getAddress } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/keccak256'
import { Logger } from '@ethersproject/logger'
import { resolveProperties } from '@ethersproject/properties'
import { Wallet } from 'ethers'
import { serializeCeloTransaction } from 'src/ethers/celoTransactions'

const logger = new Logger('CeloWallet')

const forwardErrors = [
  Logger.errors.INSUFFICIENT_FUNDS,
  Logger.errors.NONCE_EXPIRED,
  Logger.errors.REPLACEMENT_UNDERPRICED,
]

export class CeloWallet extends Wallet {
  /**
   * Override to skip checkTransaction step which rejects Celo tx properties
   * https://github.com/ethers-io/ethers.js/blob/master/packages/abstract-signer/src.ts/index.ts#L168
   */
  async populateTransaction(transaction: any): Promise<any> {
    const tx: any = await resolveProperties(transaction)

    if (tx.to != null) {
      tx.to = Promise.resolve(tx.to).then((to) => this.resolveName(to))
    }
    if (tx.gasPrice == null) {
      tx.gasPrice = this.getGasPrice()
    }
    if (tx.nonce == null) {
      tx.nonce = this.getTransactionCount('pending')
    }

    if (tx.gasLimit == null) {
      tx.gasLimit = this.estimateGas(tx).catch((error) => {
        if (forwardErrors.indexOf(error.code) >= 0) {
          throw error
        }

        return logger.throwError(
          'cannot estimate gas; transaction may fail or may require manual gas limit',
          Logger.errors.UNPREDICTABLE_GAS_LIMIT,
          {
            error: error,
            tx: tx,
          }
        )
      })
    }

    if (tx.chainId == null) {
      tx.chainId = this.getChainId()
    } else {
      tx.chainId = Promise.all([Promise.resolve(tx.chainId), this.getChainId()]).then((results) => {
        if (results[1] !== 0 && results[0] !== results[1]) {
          logger.throwArgumentError('chainId address mismatch', 'transaction', transaction)
        }
        return results[0]
      })
    }

    return await resolveProperties(tx)
  }

  /**
   * Override to serialize transaction using custom serialize method
   * https://github.com/ethers-io/ethers.js/blob/master/packages/wallet/src.ts/index.ts#L108
   */
  async signTransaction(transaction: any): Promise<string> {
    const populatedTx = await this.populateTransaction(transaction)
    const tx: any = await resolveProperties(populatedTx)

    if (tx.from != null) {
      if (getAddress(tx.from) !== this.address) {
        logger.throwArgumentError(
          'transaction from address mismatch',
          'transaction.from',
          transaction.from
        )
      }
      delete tx.from
    }

    const signature = this._signingKey().signDigest(keccak256(serializeCeloTransaction(tx)))
    const serialized = serializeCeloTransaction(tx, signature)
    return serialized
  }
}
