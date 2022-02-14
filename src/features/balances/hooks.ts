import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { areBalancesEmpty } from 'src/features/balances/utils'
import { select } from 'typed-redux-saga'

const balanceEmptySelector = createSelector(
  (s: RootState) => s.balances.accountBalances,
  (balances) => areBalancesEmpty(balances)
)

export function useAreBalancesEmpty() {
  return useSelector(balanceEmptySelector)
}

export function useVoterBalances() {
  const account = useSelector((s: RootState) => s.wallet.account)
  const { accountBalances, voterBalances } = useSelector((s: RootState) => s.balances)
  if (account.voteSignerFor && voterBalances) return { balances: accountBalances, voterBalances }
  else return { balances: accountBalances, voterBalances: accountBalances }
}

export function* selectVoterBalances() {
  const { accountBalances, voterBalances } = yield* select((state: RootState) => state.balances)
  if (voterBalances) return { balances: accountBalances, voterBalances }
  else return { balances: accountBalances, voterBalances: accountBalances }
}
