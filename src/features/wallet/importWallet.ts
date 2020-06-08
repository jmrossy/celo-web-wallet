import { ethers } from 'ethers'
import { put } from 'redux-saga/effects'
import { CELO_DERIVATION_PATH } from '../../consts'
import { createSaga } from '../../utils/saga'
import { setAddress } from './walletSlice'

function* doImportWallet(mnemonic: string) {
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath)
  yield put(setAddress(wallet.address))
}

export const { wrappedSaga: importWalletSaga, trigger: importWalletTrigger } = createSaga<string>(
  doImportWallet,
  'importWallet'
)
