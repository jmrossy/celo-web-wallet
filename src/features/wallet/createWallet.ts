import { ethers } from 'ethers'
import { put } from 'redux-saga/effects'
import { createMonitoredSaga } from '../../utils/saga'
import { setAddress } from './walletSlice'

function* doCreateWallet() {
  const wallet = ethers.Wallet.createRandom()
  yield put(setAddress(wallet.address))
}

export const {
  wrappedSaga: createWalletSaga,
  reducer: createWalletReducer,
  actions: createWalletActions,
} = createMonitoredSaga(doCreateWallet, { name: 'create-wallet' })
