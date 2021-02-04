import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { CeloContract, config } from 'src/config'
import { BALANCE_STALE_TIME } from 'src/consts'
import { fetchLockedCeloBalances } from 'src/features/lock/fetchLockedBalances'
import { LockedCeloBalances } from 'src/features/lock/types'
import { Balances } from 'src/features/wallet/types'
import { updateBalances } from 'src/features/wallet/walletSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)
  if (!address) {
    throw new Error('Cannot fetch balances before address is set')
  }

  const balances = yield* call(_fetchBalances, address)
  yield* put(updateBalances(balances))
  return balances
}

export function* fetchBalancesIfStale() {
  const balances = yield* select((state: RootState) => state.wallet.balances)
  const { lastUpdated, cUsd, celo } = balances

  if (
    isStale(lastUpdated, BALANCE_STALE_TIME) ||
    BigNumber.from(cUsd).isZero() ||
    BigNumber.from(celo).isZero()
  ) {
    return yield* call(fetchBalances)
  } else {
    return balances
  }
}

async function _fetchBalances(address: string): Promise<Balances> {
  const [celo, cUsd] = await Promise.all([fetchCeloBalance(address), fetchDollarBalance(address)])

  let lockedCelo: LockedCeloBalances
  if (config.isElectron) {
    lockedCelo = await fetchLockedCeloBalances(address)
  } else {
    lockedCelo = {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    }
  }

  return { celo, cUsd, lockedCelo, lastUpdated: Date.now() }
}

async function fetchCeloBalance(address: string) {
  const provider = getProvider()
  const balance = await provider.getBalance(address)
  return balance.toString()
}

async function fetchDollarBalance(address: string) {
  const stableToken = getContract(CeloContract.StableToken)
  const balance: BigNumber = await stableToken.balanceOf(address)
  return balance.toString()
}

export const {
  name: fetchBalancesSagaName,
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(fetchBalances, 'fetchBalances')
