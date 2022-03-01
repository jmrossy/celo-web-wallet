import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { appSelect } from 'src/app/appSelect'
import { useAppSelector } from 'src/app/hooks'
import type { AppState } from 'src/app/store'
import { BalancesWithTokens, TokenBalances } from 'src/features/balances/types'
import { areBalancesEmpty } from 'src/features/balances/utils'
import { TokenMap } from 'src/features/tokens/types'
import { logger } from 'src/utils/logger'

export function useBalances() {
  return useAppSelector((state) => state.balances.accountBalances)
}

const balanceEmptySelector = createSelector(
  (s: AppState) => s.balances.accountBalances,
  (balances) => areBalancesEmpty(balances)
)

export function useAreBalancesEmpty() {
  return useSelector(balanceEmptySelector)
}

const balancesWithTokensSelector = createSelector(
  (s: AppState) => s.tokens.byAddress,
  (s: AppState) => s.balances.accountBalances,
  (addressToToken, accountBalances) => ({
    ...accountBalances,
    tokens: getMergedTokenBalances(addressToToken, accountBalances.tokenAddrToValue),
  })
)

export function getMergedTokenBalances(
  addressToToken: TokenMap,
  tokenAddrToValue: Record<string, string>
): TokenBalances {
  const tokenAddresses = Object.keys(tokenAddrToValue)
  return tokenAddresses.reduce<TokenBalances>((result, addr) => {
    if (!addressToToken[addr]) {
      logger.warn('Token missing for balance for address', addr)
      return result
    } else {
      const token = addressToToken[addr]
      const value = tokenAddrToValue[addr]
      result[addr] = {
        ...token,
        value,
      }
      return result
    }
  }, {})
}

export function useBalancesWithTokens(): BalancesWithTokens {
  return useSelector(balancesWithTokensSelector)
}

export function useVoterBalances() {
  const account = useAppSelector((s) => s.wallet.account)
  const { accountBalances, voterBalances } = useAppSelector((s) => s.balances)
  if (account.voteSignerFor && voterBalances) return { balances: accountBalances, voterBalances }
  else return { balances: accountBalances, voterBalances: accountBalances }
}

export function* selectVoterBalances() {
  const { accountBalances, voterBalances } = yield* appSelect((state) => state.balances)
  if (voterBalances) return { balances: accountBalances, voterBalances }
  else return { balances: accountBalances, voterBalances: accountBalances }
}
