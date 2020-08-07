import { RootState } from 'src/app/rootReducer'
import { CeloContract } from 'src/config'
import { getContract } from 'src/provider/contracts'
import { getProvider } from 'src/provider/provider'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'
import { updateBalances } from './walletSlice'

function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)
  const { cGld, cUsd } = yield* call(fetchAllBalances, address)
  console.log('cGld', cGld)
  console.log('cUsd', cUsd)
  yield* put(updateBalances({ cUsd, cGld, lastUpdated: Date.now() }))
}

async function fetchAllBalances(address: string) {
  const [cGld, cUsd] = await Promise.all([fetchGoldBalance(address), fetchDollarBalance(address)])
  return { cGld, cUsd }
}

async function fetchGoldBalance(address: string) {
  const provider = getProvider()
  const balance = await provider.getBalance(address)
  return balance.toString()
}

async function fetchDollarBalance(address: string) {
  const stableToken = getContract(CeloContract.StableToken)
  const balance = await stableToken.balanceOf(address)
  return balance.toString()
}

export const {
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(fetchBalances, { name: 'fetch-balances' })
