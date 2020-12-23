import { CeloTransactionRequest, serializeCeloTransaction } from '@celo-tools/celo-ethers-wrapper'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { BigNumber, providers, Signer, utils } from 'ethers'
import { config } from 'src/config'
import { CELO_LEDGER_APP_VERSION } from 'src/consts'
import { CeloLedgerApp } from 'src/features/ledger/CeloLedgerApp'
import { getTokenData } from 'src/features/ledger/tokenData'
import { areAddressesEqual, ensureLeading0x, trimLeading0x } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/sleep'

// Based partly on https://github.com/ethers-io/ethers.js/blob/master/packages/hardware-wallets/src.ts/ledger.ts
// But with customizations for the Celo network
export class LedgerSigner extends Signer {
  private celoApp: CeloLedgerApp | undefined
  address: string | undefined

  constructor(readonly provider: providers.Provider, readonly path: string) {
    super()
  }

  async init() {
    if (this.celoApp) throw new Error('Ledger Signer already initialized')

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

    this.celoApp = new CeloLedgerApp(transport)
    await this.validateCeloAppVersion()

    const account = await this.perform((celoApp) => celoApp.getAddress(this.path, true))
    this.address = utils.getAddress(account.address)
  }

  private async validateCeloAppVersion() {
    const appConfiguration = await this.perform((celoApp) => celoApp.getAppConfiguration())

    if (appConfiguration?.version !== CELO_LEDGER_APP_VERSION) {
      throw new Error(`Unsupported Ledger app version, must be ${CELO_LEDGER_APP_VERSION}`)
    }

    if (!appConfiguration?.arbitraryDataEnabled) {
      throw new Error(
        'Ledger does not allow contract data. Required for safe token transfers. Enable it from the ledger app settings.'
      )
    }
  }

  async populateTransaction(transaction: utils.Deferrable<CeloTransactionRequest>): Promise<any> {
    const tx: any = await utils.resolveProperties(transaction)

    if (!tx.to || !tx.gasPrice || !tx.gasLimit) {
      logger.error('To, gasPrice, and gasLimit fields all mandatory', tx)
      throw new Error('Tx is missing mandatory fields')
    }

    if (tx.nonce == null) {
      const nonce = await this.getTransactionCount('pending')
      tx.nonce = BigNumber.from(nonce).toNumber()
    }

    if (tx.chainId == null) {
      tx.chainId = config.chainId
    } else if (tx.chainId !== config.chainId) {
      throw new Error('Chain Id mismatch')
    }

    return tx
  }

  private async perform<T = any>(callback: (celoApp: CeloLedgerApp) => Promise<T>): Promise<T> {
    if (!this.celoApp) {
      throw new Error('LedgerSigner must be initiated before used')
    }

    // Wait up to 5 seconds
    for (let i = 0; i < 5; i++) {
      try {
        const result = await callback(this.celoApp)
        return result
      } catch (error) {
        // TODO better error handling here with typed errors from ledgerjs error package
        if (error.id !== 'TransportLocked') {
          throw error
        }
      }
      await sleep(1000)
    }

    throw new Error('All LedgerSigner retry attempts failed')
  }

  async getAddress(): Promise<string> {
    if (!this.address) throw new Error('LedgerSigner must be initiated before getting address')
    return this.address
  }

  async signMessage(message: utils.Bytes | string): Promise<string> {
    if (typeof message === 'string') {
      message = utils.toUtf8Bytes(message)
    }

    // Ledger expects hex without leading 0x
    const messageHex = trimLeading0x(utils.hexlify(message))

    const sig = await this.perform((celoApp) => celoApp.signPersonalMessage(this.path, messageHex))
    sig.r = ensureLeading0x(sig.r)
    sig.s = ensureLeading0x(sig.s)
    return utils.joinSignature(sig)
  }

  async signTransaction(transaction: CeloTransactionRequest): Promise<string> {
    const tx = await this.populateTransaction(transaction)

    if (tx.from != null) {
      if (utils.getAddress(tx.from) !== this.address) {
        throw new Error('Transaction from address mismatch')
      }
      delete tx.from
    }

    const toTokenInfo = getTokenData(transaction.to)
    const feeTokenInfo = getTokenData(transaction.feeCurrency)
    if (toTokenInfo) {
      await this.perform((celoApp) => celoApp.provideERC20TokenInformation(toTokenInfo))
    }
    if (
      feeTokenInfo &&
      (!toTokenInfo ||
        !areAddressesEqual(toTokenInfo.contractAddress, feeTokenInfo.contractAddress))
    ) {
      await this.perform((celoApp) => celoApp.provideERC20TokenInformation(feeTokenInfo))
    }

    // Ledger expects hex without leading 0x
    const unsignedTx = trimLeading0x(serializeCeloTransaction(tx))
    const sig = await this.perform((celoApp) => celoApp.signTransaction(this.path, unsignedTx))

    return serializeCeloTransaction(tx, {
      v: BigNumber.from(ensureLeading0x(sig.v)).toNumber(),
      r: ensureLeading0x(sig.r),
      s: ensureLeading0x(sig.s),
    })
  }

  // Override just for type fix
  sendTransaction(
    transaction: utils.Deferrable<CeloTransactionRequest>
  ): Promise<providers.TransactionResponse> {
    return super.sendTransaction(transaction)
  }

  connect(): Signer {
    throw new Error('Connect method unimplemented on LedgerSigner')
  }
}
