import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { CeloContract, config } from 'src/config'
import { BALANCE_STALE_TIME } from 'src/consts'
import { CELO, cUSD, Token, TokenWithBalance } from 'src/currency'
import { fetchLockedCeloStatus, fetchTotalLocked } from 'src/features/lock/fetchLockedStatus'
import { LockedCeloBalances } from 'src/features/lock/types'
import { fetchStakingBalances } from 'src/features/validators/fetchGroupVotes'
import { fetchAccountStatus } from 'src/features/wallet/accountsContract'
import { areBalancesEmpty } from 'src/features/wallet/utils'
import {
  setVoterBalances,
  updateBalances,
  walletInitialState,
} from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'
import { Balances, TokenBalances } from './types'

// Fetch wallet balances and other frequently used data like votes
// Essentially, fetch all the data that forms need to validate inputs
function* fetchBalances() {
  const { address, balances } = yield* select((state: RootState) => state.wallet)
  if (!address) throw new Error('Cannot fetch balances before address is set')

  const newTokenBalances = yield* call(fetchTokenBalances, address, balances.tokens)

  let lockedCelo: LockedCeloBalances
  if (config.isElectron) {
    yield* call(fetchAccountStatus)
    lockedCelo = yield* call(fetchLockedCeloStatus)
  } else {
    lockedCelo = { ...walletInitialState.balances.lockedCelo }
  }

  const newBalances: Balances = { tokens: newTokenBalances, lockedCelo, lastUpdated: Date.now() }
  yield* put(updateBalances(newBalances))

  if (config.isElectron) {
    yield* call(fetchStakingBalances)
    yield* call(fetchVoterBalances)
  }

  return newBalances
}

export function* fetchBalancesIfStale() {
  const balances = yield* select((state: RootState) => state.wallet.balances)
  if (isStale(balances.lastUpdated, BALANCE_STALE_TIME) || areBalancesEmpty(balances)) {
    return yield* call(fetchBalances)
  } else {
    return balances
  }
}

async function fetchTokenBalances(
  address: string,
  tokensBalances: TokenBalances
): Promise<TokenBalances> {
  const tokens = Object.values(tokensBalances)
  const fetchPromises: Promise<TokenWithBalance>[] = []
  for (const t of tokens) {
    logger.debug(`Fetching ${t.id} balance`)
    if (t.id === CELO.id) {
      fetchPromises.push(fetchCeloBalance(address))
    } else {
      fetchPromises.push(fetchTokenBalance(address, t))
    }
  }

  const tokenBalancesArr = await Promise.all(fetchPromises)
  const tokenBalances = { ...walletInitialState.balances.tokens }
  tokenBalancesArr.forEach((bal) => (tokenBalances[bal.id] = bal))
  return tokenBalances
}

async function fetchCeloBalance(address: string): Promise<TokenWithBalance> {
  const provider = getProvider()
  const balance = await provider.getBalance(address)
  return { ...CELO, value: balance.toString() }
}

async function fetchTokenBalance(address: string, token: Token): Promise<TokenWithBalance> {
  // TODO dynamically find the right contract and query it
  const stableToken = getContract(CeloContract.StableToken)
  const balance: BigNumber = await stableToken.balanceOf(address)
  return { ...cUSD, value: balance.toString() }
}

function* fetchVoterBalances() {
  const voteSignerFor = yield* select((state: RootState) => state.wallet.account.voteSignerFor)
  if (!voteSignerFor) return

  // Only the total locked is used for now so just fetching that bit
  const locked = yield* call(fetchTotalLocked, voteSignerFor)
  const voterBalances = {
    ...walletInitialState.balances,
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
