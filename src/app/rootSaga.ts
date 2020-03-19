import { spawn } from 'redux-saga/effects'
import walletSaga from '../features/wallet/walletSaga'

export default function* root() {
  yield spawn(walletSaga)
}
