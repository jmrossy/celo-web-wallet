import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { CeloContract, config } from 'src/config'
import { BALANCE_STALE_TIME } from 'src/consts'
import { fetchLockedCeloStatus } from 'src/features/lock/fetchLockedStatus'
import { setLockedCeloStatus } from 'src/features/lock/lockSlice'
import { LockedCeloBalances } from 'src/features/lock/types'
import { fetchGroupVotes } from 'src/features/validators/fetchGroupVotes'
import { updateGroupVotes } from 'src/features/validators/validatorsSlice'
import { updateBalances } from 'src/features/wallet/walletSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

// Fetch wallet balances and other frequently used data like votes
// Essentially, fetch all the data that forms need to validate inputs
function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)
  if (!address) {
    throw new Error('Cannot fetch balances before address is set')
  }

  const { celo, cUsd } = yield* call(fetchTokenBalances, address)

  let lockedCelo: LockedCeloBalances
  if (config.isElectron) {
    const lockedCeloStatus = yield* call(fetchLockedCeloStatus, address)
    yield* put(setLockedCeloStatus(lockedCeloStatus))
    lockedCelo = lockedCeloStatus
  } else {
    lockedCelo = {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    }
  }

  const balances = { celo, cUsd, lockedCelo, lastUpdated: Date.now() }
  yield* put(updateBalances(balances))

  // TODO need to support signer indirection
  const validatorGroupVotes = yield* call(fetchGroupVotes, address)
  yield* put(updateGroupVotes(validatorGroupVotes))

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

async function fetchTokenBalances(address: string) {
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
  const balance: BigNumber = await stableToken.balanceOf(address)
  return balance.toString()
}

export const {
  name: fetchBalancesSagaName,
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(fetchBalances, 'fetchBalances')
