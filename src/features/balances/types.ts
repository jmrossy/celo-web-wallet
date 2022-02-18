import { LockedCeloBalances } from 'src/features/lock/types'
import { Token, TokenWithBalance } from 'src/tokens'

export type TokenBalances = Record<string, TokenWithBalance> // Token address to token with balance object

export interface Balances {
  // All balances are represented in wei
  tokenAddrToValue: Record<string, string>
  lockedCelo: LockedCeloBalances
  lastUpdated: number | null
}

// It's convenient for the UI to have a single object with the tokens and
// their balances values merged together.
export interface BalancesWithTokens extends Balances {
  tokens: TokenBalances // tokenAddrToToken but shortening because it's very commonly used
}

export interface BalanceTableRow {
  id: string
  label: string
  balance: number
  balanceWei: string
  address: string
  token: Token
  onRemove?: (id: string) => void
}
