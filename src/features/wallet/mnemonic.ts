import { isValidDerivationPath, isValidMnemonic } from 'src/features/wallet/utils'

export class Mnemonic {
  private readonly _mnemonic: string
  private readonly _derivationPath: string
  private readonly _locale?: string
  private constructor(mnemonic: string, derivationPath: string, locale?: string) {
    this._mnemonic = mnemonic
    this._derivationPath = derivationPath
    this._locale = locale
    Object.freeze(this)
  }

  static from(mnemonic: string, derivationPath: string, locale?: string) {
    if (!isValidMnemonic(mnemonic)) throw new Error('Invalid mnemonic for pending account')
    if (!isValidDerivationPath(derivationPath))
      throw new Error('Invalid derivationPath for pending account')
    if (locale && locale !== 'en') throw new Error('Invalid locale, only en currently supported')
    return new Mnemonic(mnemonic, derivationPath, locale)
  }

  read() {
    return { mnemonic: this._mnemonic, derivationPath: this._derivationPath, locale: this._locale }
  }
}
