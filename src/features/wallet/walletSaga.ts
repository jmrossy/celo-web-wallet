import { ethers } from 'ethers'
import { put, takeLeading } from 'redux-saga/effects'
import { createWallet, setAddress } from './walletSlice'

function* doCreateWallet() {
  console.debug('Creating new wallet')
  const wallet = ethers.Wallet.createRandom()
  yield put(setAddress(wallet.address))
}

export default function* walletSaga() {
  yield takeLeading(createWallet.type, doCreateWallet)
}
