import { ethers } from 'ethers'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { setSigner } from 'src/provider/signer'
import { createSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { setAddress } from './walletSlice'

export function* importWallet(mnemonic: string) {
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath)
  setSigner(wallet)
  yield* put(setAddress(wallet.address))
}

export const { wrappedSaga: importWalletSaga, trigger: importWalletTrigger } = createSaga<string>(
  importWallet,
  'importWallet'
)
