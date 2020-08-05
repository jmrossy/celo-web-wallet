import { ethers } from 'ethers'
import { call, put, select } from 'redux-saga/effects'
import { RootState } from '../../app/rootReducer'
import { createMonitoredSaga } from '../../utils/saga'
import { getProvider } from '../provider/provider'
import { ABI as StableTokenAbi, CONTRACT_ADDRESS } from '../tokens/stableToken'
import { updateBalances } from './walletSlice'

function* doFetchBalances() {
  const address = yield select((state: RootState) => state.wallet.address)
  const cGld = yield call(fetchGoldBalance, address)
  const cUsd = yield call(fetchDollarBalance, address)
  console.log('cGld', cGld)
  console.log('cUsd', cUsd)
  yield put(
    updateBalances({ cUsd: cUsd.toString(), cGld: cGld.toString(), lastUpdated: Date.now() })
  )
}

async function fetchGoldBalance(address: string) {
  const provider = getProvider()
  return provider.getBalance(address)
}

async function fetchDollarBalance(address: string) {
  const provider = getProvider()
  const stableTokenContract = new ethers.Contract(CONTRACT_ADDRESS, StableTokenAbi, provider)
  console.log(stableTokenContract)
  console.log(JSON.stringify(stableTokenContract))
  return stableTokenContract.balanceOf(address)
}

export const {
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(doFetchBalances, { name: 'fetch-balances' })
