import { BigNumber, BigNumberish, Contract } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getContractByAddress, getTokenContract } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { config } from 'src/config'
import { BALANCE_STALE_TIME } from 'src/consts'
import {
  balancesInitialState,
  setVoterBalances,
  updateBalances,
} from 'src/features/balances/balancesSlice'
import { Balances } from 'src/features/balances/types'
import { areBalancesEmpty } from 'src/features/balances/utils'
import { fetchLockedCeloStatus, fetchTotalLocked } from 'src/features/lock/fetchLockedStatus'
import { LockedCeloBalances } from 'src/features/lock/types'
import { TokenMap } from 'src/features/tokens/types'
import { isNativeTokenAddress } from 'src/features/tokens/utils'
import { fetchStakingBalances } from 'src/features/validators/fetchGroupVotes'
import { fetchAccountStatus } from 'src/features/wallet/accounts/accountsContract'
import { CELO } from 'src/tokens'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

// Fetch wallet balances and other frequently used data like votes
// Essentially, fetch all the data that forms need to validate inputs
function* fetchBalances() {
  const address = yield* select((state: RootState) => state.wallet.address)
  if (!address) throw new Error('Cannot fetch balances before address is set')

  const tokenAddrToToken = yield* select((state: RootState) => state.tokens.byAddress)
  const tokenAddrToValue = yield* call(fetchTokenBalances, address, tokenAddrToToken)

  let lockedCelo: LockedCeloBalances
  if (config.isElectron) {
    yield* call(fetchAccountStatus)
    lockedCelo = yield* call(fetchLockedCeloStatus)
  } else {
    lockedCelo = { ...balancesInitialState.accountBalances.lockedCelo }
  }

  const newBalances: Balances = { tokenAddrToValue, lockedCelo, lastUpdated: Date.now() }
  yield* put(updateBalances(newBalances))

  if (config.isElectron) {
    yield* call(fetchStakingBalances)
    yield* call(fetchVoterBalances)
  }

  return newBalances
}

export function* fetchBalancesIfStale() {
  const balances = yield* select((state: RootState) => state.balances.accountBalances)
  if (isStale(balances.lastUpdated, BALANCE_STALE_TIME) || areBalancesEmpty(balances)) {
    return yield* call(fetchBalances)
  } else {
    return balances
  }
}

async function fetchTokenBalances(
  address: string,
  tokenMap: TokenMap
): Promise<Record<string, string>> {
  const tokenAddrs = Object.keys(tokenMap)
  // TODO may be good to batch here if token list is really long
  const fetchPromises: Promise<{ tokenAddress: string; value: string }>[] = []
  for (const tokenAddr of tokenAddrs) {
    // logger.debug(`Fetching ${t.id} balance`)
    if (tokenAddr === CELO.address) {
      fetchPromises.push(fetchCeloBalance(address))
    } else {
      fetchPromises.push(fetchTokenBalance(address, tokenAddr))
    }
  }

  const newTokenAddrToValue: Record<string, string> = {}
  const tokenBalancesArr = await Promise.all(fetchPromises)
  tokenBalancesArr.forEach((bal) => (newTokenAddrToValue[bal.tokenAddress] = bal.value))
  return newTokenAddrToValue
}

// TODO Figure out why the balanceOf result is incorrect for GoldToken
// Contractkit works around this in the same way, must be a low-level issue
async function fetchCeloBalance(address: string) {
  const provider = getProvider()
  const balance = await provider.getBalance(address)
  return { tokenAddress: CELO.address, value: balance.toString() }
}

async function fetchTokenBalance(address: string, tokenAddress: string) {
  let contract: Contract | null
  if (isNativeTokenAddress(tokenAddress)) {
    contract = getContractByAddress(tokenAddress)
  } else {
    contract = getTokenContract(tokenAddress)
  }
  if (!contract) throw new Error(`No contract found for token: ${tokenAddress}`)
  const balance: BigNumberish = await contract.balanceOf(address)
  return { tokenAddress, value: BigNumber.from(balance).toString() }
}

function* fetchVoterBalances() {
  const voteSignerFor = yield* select((state: RootState) => state.wallet.account.voteSignerFor)
  if (!voteSignerFor) return

  // Only the total locked is used for now so just fetching that bit
  const locked = yield* call(fetchTotalLocked, voteSignerFor)
  const voterBalances = {
    tokenAddrToValue: {},
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
