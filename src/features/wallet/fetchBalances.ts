import { call, put, select } from 'redux-saga/effects'
import { RootState } from '../../app/rootReducer'
import { createMonitoredSaga } from '../../utils/saga'
import { getProvider } from '../provider/provider'
import { updateBalances } from './walletSlice'

function* doFetchBalances() {
  const address = yield select((state: RootState) => state.wallet.address)
  const cGld = yield call(fetchGoldBalance, address)
  yield put(updateBalances({ cUsd: '0', cGld: cGld.toString(), lastUpdated: Date.now() }))
}

// async function fetchDollarBalance(address: string) {
//   // TODO
// }

async function fetchGoldBalance(address: string) {
  const provider = getProvider()
  return provider.getBalance(address)
}

export const {
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(doFetchBalances, { name: 'fetch-balances' })
