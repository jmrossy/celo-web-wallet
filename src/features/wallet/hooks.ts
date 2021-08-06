import { createSelector } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { NULL_ADDRESS } from 'src/consts'
import { getAccounts } from 'src/features/wallet/manager'
import { StoredAccountData } from 'src/features/wallet/storage'
import { areBalancesEmpty } from 'src/features/wallet/utils'
import { logger } from 'src/utils/logger'
import { select } from 'typed-redux-saga'

const balanceEmptySelector = createSelector(
  (s: RootState) => s.wallet.balances,
  (balances) => areBalancesEmpty(balances)
)

export function useAreBalancesEmpty() {
  return useSelector(balanceEmptySelector)
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

export function useAccountList(
  onReady?: (accs: StoredAccountData[]) => void,
  refetchTrigger?: boolean
) {
  const [accounts, setAccounts] = useState<StoredAccountData[] | null>(null)
  useEffect(
    () => {
      // Get account list on screen mount
      const storedAccounts = getAccounts()
      if (!storedAccounts?.size) {
        logger.warn('No accounts found')
        return
      }
      const accountList = Array.from(storedAccounts.values())
      setAccounts(accountList)
      if (onReady) onReady(accountList)
    },
    typeof refetchTrigger === 'boolean' ? [refetchTrigger] : []
  )
  return accounts
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
