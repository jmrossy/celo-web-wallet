import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { CeloContract } from 'src/config'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'
import { updateBalances } from './walletSlice'

const BALANCE_STALE_TIME = 15000 // 15 seconds

function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)

  if (!address) {
    throw new Error('Cannot fetch balances before address is set')
  }

  const { celo, cUsd } = yield* call(_fetchBalances, address)
  const balances = { cUsd, celo, lastUpdated: Date.now() }
  yield* put(updateBalances(balances))
  return balances
}

export function* fetchBalancesIfStale() {
  const balances = yield* select((state: RootState) => state.wallet.balances)
  const { lastUpdated, cUsd, celo } = balances

  if (
    !lastUpdated ||
    Date.now() - lastUpdated > BALANCE_STALE_TIME ||
    BigNumber.from(cUsd).isZero() ||
    BigNumber.from(celo).isZero()
  ) {
    return yield* call(fetchBalances)
  } else {
    return balances
  }
}

async function _fetchBalances(address: string) {
  const [celo, cUsd] = await Promise.all([fetchCeloBalance(address), fetchDollarBalance(address)])
  return { celo, cUsd }
}

async function fetchCeloBalance(address: string) {
  const provider = getProvider()
  const balance = await provider.getBalance(address)
  return balance.toString()
}

async function fetchDollarBalance(address: string) {
  const stableToken = await getContract(CeloContract.StableToken)
  const balance = await stableToken.balanceOf(address)
  return balance.toString()
}

export const {
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(fetchBalances, 'fetchBalances')
