import { clearTransactions } from 'src/features/feed/feedSlice'
import { removeWallet } from 'src/features/wallet/storage'
import { clearWallet } from 'src/features/wallet/walletSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

export function* logout() {
  yield put(clearWallet())
  yield put(clearTransactions())
  yield* call(removeWallet)
}

export const {
  name: logoutSagaName,
  wrappedSaga: logoutSaga,
  reducer: logoutReducer,
  actions: logoutActions,
} = createMonitoredSaga(logout, 'logout')
