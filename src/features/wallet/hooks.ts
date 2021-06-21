import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { NULL_ADDRESS } from 'src/consts'
import { areBalancesEmpty } from 'src/features/wallet/utils'
import { select } from 'typed-redux-saga'

const balanceEmptySelector = createSelector(
  (s: RootState) => s.wallet.balances,
  (balances) => areBalancesEmpty(balances)
)

export function useAreBalancesEmpty() {
  const isEmpty = useSelector(balanceEmptySelector)
  return isEmpty
}

export function useTokens() {
  return useSelector((s: RootState) => s.wallet.balances.tokens)
}

export function useIsVoteSignerAccount() {
  const voteSignerFor = useSelector((s: RootState) => s.wallet.account.voteSignerFor)
  return !!voteSignerFor
}

export function useVoterBalances() {
  const { balances, account, voterBalances } = useSelector((s: RootState) => s.wallet)
  if (account.voteSignerFor && voterBalances) return { balances, voterBalances }
  else return { balances, voterBalances: balances }
}

export function* selectVoterBalances() {
  const { balances, voterBalances } = yield* select((state: RootState) => state.wallet)
  if (voterBalances) return { balances, voterBalances }
  else return { balances, voterBalances: balances }
}

export function useWalletAddress() {
  const address = useSelector((s: RootState) => s.wallet.address)
  return address || NULL_ADDRESS
}

export function useVoterAccountAddress() {
  const { address, account } = useSelector((s: RootState) => s.wallet)
  return account.voteSignerFor ?? address ?? NULL_ADDRESS
}

export function* selectVoterAccountAddress() {
  const { address, account } = yield* select((state: RootState) => state.wallet)
  if (!address || !account.lastUpdated)
    throw new Error('Attempting to select vote signer before wallet is initialized')
  return account.voteSignerFor ?? address
}
