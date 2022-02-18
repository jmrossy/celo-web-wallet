import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { BalancesWithTokens, TokenBalances } from 'src/features/balances/types'
import { areBalancesEmpty } from 'src/features/balances/utils'
import { TokenMap } from 'src/features/tokens/types'
import { logger } from 'src/utils/logger'
import { select } from 'typed-redux-saga'

const balanceEmptySelector = createSelector(
  (s: RootState) => s.balances.accountBalances,
  (balances) => areBalancesEmpty(balances)
)

export function useAreBalancesEmpty() {
  return useSelector(balanceEmptySelector)
}

const balancesWithTokensSelector = createSelector(
  (s: RootState) => s.tokens.byAddress,
  (s: RootState) => s.balances.accountBalances,
  (addressToToken, accountBalances) => ({
    ...accountBalances,
    tokens: getMergedTokenBalances(addressToToken, accountBalances.tokenAddrToValue),
  })
)

function getMergedTokenBalances(
  addressToToken: TokenMap,
  tokenAddrToValue: Record<string, string>
): TokenBalances {
  const tokenAddresses = Object.keys(tokenAddrToValue)
  return tokenAddresses.reduce<TokenBalances>((result, addr) => {
    if (!addressToToken[addr]) {
      logger.error('Token missing for balance for address', addr)
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

// TODO make this return BalancesWithTokens?
export function useVoterBalances() {
  const account = useSelector((s: RootState) => s.wallet.account)
  const { accountBalances, voterBalances } = useSelector((s: RootState) => s.balances)
  if (account.voteSignerFor && voterBalances) return { balances: accountBalances, voterBalances }
  else return { balances: accountBalances, voterBalances: accountBalances }
}

// TODO make this return BalancesWithTokens?
export function* selectVoterBalances() {
  const { accountBalances, voterBalances } = yield* select((state: RootState) => state.balances)
  if (voterBalances) return { balances: accountBalances, voterBalances }
  else return { balances: accountBalances, voterBalances: accountBalances }
}
