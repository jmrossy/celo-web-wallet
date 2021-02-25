import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { CeloContract, config } from 'src/config'
import { BALANCE_STALE_TIME } from 'src/consts'
import { fetchLockedCeloStatus, fetchTotalLocked } from 'src/features/lock/fetchLockedStatus'
import { LockedCeloBalances } from 'src/features/lock/types'
import { fetchStakingBalances } from 'src/features/validators/fetchGroupVotes'
import { fetchAccountStatus } from 'src/features/wallet/accountsContract'
import { setVoterBalances, updateBalances } from 'src/features/wallet/walletSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

// Fetch wallet balances and other frequently used data like votes
// Essentially, fetch all the data that forms need to validate inputs
function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)
  if (!address) throw new Error('Cannot fetch balances before address is set')

  const { celo, cUsd } = yield* call(fetchTokenBalances, address)

  let lockedCelo: LockedCeloBalances
  if (config.isElectron) {
    yield* call(fetchAccountStatus)
    lockedCelo = yield* call(fetchLockedCeloStatus)
  } else {
    lockedCelo = {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    }
  }

  const balances = { celo, cUsd, lockedCelo, lastUpdated: Date.now() }
  yield* put(updateBalances(balances))

  if (config.isElectron) {
    yield* call(fetchStakingBalances)
    yield* call(fetchVoterBalances)
  }

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

function* fetchVoterBalances() {
  const { isRegistered, voteSignerFor } = yield* select((state: RootState) => state.wallet.account)
  if (!isRegistered || !voteSignerFor) return

  // Only the total locked is used for now so just fetching that bit
  const locked = yield* call(fetchTotalLocked, voteSignerFor)
  const voterBalances = {
    cUsd: '0',
    celo: '0',
    lockedCelo: {
      locked,
      pendingBlocked: '0',
      pendingFree: '0',
    },
    lastUpdated: Date.now(),
  }
  yield* put(setVoterBalances(voterBalances))
}

export const {
  name: fetchBalancesSagaName,
  wrappedSaga: fetchBalancesSaga,
  reducer: fetchBalancesReducer,
  actions: fetchBalancesActions,
} = createMonitoredSaga(fetchBalances, 'fetchBalances')
