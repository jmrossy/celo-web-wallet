import { ethers } from 'ethers'
import { setSigner } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { createSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { setAddress } from './walletSlice'

export function* importWallet(mnemonic: string) {
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath)
  setSigner(wallet)
  yield* put(setAddress(wallet.address))
}

export const { wrappedSaga: importWalletSaga, actions: importWalletActions } = createSaga<string>(
  importWallet,
  'importWallet'
)
