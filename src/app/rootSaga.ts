import { combineReducers } from '@reduxjs/toolkit'
import { spawn } from 'redux-saga/effects'
import { createWalletReducer, createWalletSaga } from '../features/wallet/walletSaga'

export const monitoredSagaReducers = combineReducers({ createWallet: createWalletReducer })

export function* rootSaga() {
  yield spawn(createWalletSaga)
}
