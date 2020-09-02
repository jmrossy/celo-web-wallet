import { RootState } from 'src/app/rootReducer'
import { CeloContract } from 'src/config'
import { getContract } from 'src/provider/contracts'
import { getProvider } from 'src/provider/provider'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'
import { updateBalances } from './walletSlice'

function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)
  const { celo, cUsd } = yield* call(doFetchBalances, address)
  yield* put(updateBalances({ cUsd, celo, lastUpdated: Date.now() }))
}

async function doFetchBalances(address: string) {
  const [celo, cUsd] = await Promise.all([fetchCeloBalance(address), fetchDollarBalance(address)])
  return { celo, cUsd }
}

async function fetchCeloBalance(address: string) {
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
