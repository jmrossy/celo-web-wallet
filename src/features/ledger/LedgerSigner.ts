import Eth from '@ledgerhq/hw-app-eth'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { BigNumber, providers, Signer, utils } from 'ethers'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/sleep'

interface Eth {
  getAddress: (path: string) => Promise<any>
  signPersonalMessage: (path: string, messageHex: string) => Promise<any>
  signTransaction: (path: string, rawTxHex: string) => Promise<any>
}

// Based partly on https://github.com/ethers-io/ethers.js/blob/master/packages/hardware-wallets/src.ts/ledger.ts
// But with customizations for the Celo network
export class LedgerSigner extends Signer {
  private _eth: Eth | undefined

  constructor(readonly provider: providers.Provider, readonly path: string) {
    super()
  }

  async init() {
    if (this._eth) throw new Error('Ledger Signer already initialized')

    let transport
    if (await TransportWebUSB.isSupported()) {
      logger.debug('WebUSB appears to be supported')
      transport = await TransportWebUSB.create()
    } else if (await TransportU2F.isSupported()) {
      logger.debug('U2F appears to be supported')
      transport = await TransportU2F.create()
    } else {
      throw new Error('Neither WebUsb nor U2F are supported')
    }

    this._eth = new Eth(transport)
  }

  async _retry<T = any>(callback: (eth: Eth) => Promise<T>): Promise<T> {
    if (!this._eth) {
      throw new Error('Ledger signer not initiated')
    }

    // Wait up to 5 seconds
    for (let i = 0; i < 5; i++) {
      try {
        const result = await callback(this._eth)
        return result
      } catch (error) {
        if (error.id !== 'TransportLocked') {
          throw error
        }
      }
      await sleep(1000)
    }

    throw new Error('All LedgerSigner retry attempts failed')
  }

  async getAddress(): Promise<string> {
    const account = await this._retry((eth) => eth.getAddress(this.path))
    return utils.getAddress(account.address)
  }

  async signMessage(message: utils.Bytes | string): Promise<string> {
    if (typeof message === 'string') {
      message = utils.toUtf8Bytes(message)
    }

    const messageHex = utils.hexlify(message).substring(2)

    const sig = await this._retry((eth) => eth.signPersonalMessage(this.path, messageHex))
    sig.r = '0x' + sig.r
    sig.s = '0x' + sig.s
    return utils.joinSignature(sig)
  }

  async signTransaction(transaction: providers.TransactionRequest): Promise<string> {
    // TODO use Celo fields here
    const tx = await utils.resolveProperties(transaction)
    const baseTx: utils.UnsignedTransaction = {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      gasPrice: tx.gasPrice || undefined,
      nonce: tx.nonce ? BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    }

    const unsignedTx = utils.serializeTransaction(baseTx).substring(2)
    const sig = await this._retry((eth) => eth.signTransaction(this.path, unsignedTx))

    return utils.serializeTransaction(baseTx, {
      v: BigNumber.from('0x' + sig.v).toNumber(),
      r: '0x' + sig.r,
      s: '0x' + sig.s,
    })
  }

  connect(): Signer {
    throw new Error('Connect method unimplemented on LedgerSigner')
    // TODO
    // return new LedgerSigner(provider, this.path);
  }
}
