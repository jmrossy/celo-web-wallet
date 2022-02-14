import { LockedCeloBalances } from 'src/features/lock/types'
import { Token } from 'src/tokens'

export type TokenBalances = Record<string, string> // token address to balance in wei

export interface Balances {
  // All balances are represented in wei
  tokens: TokenBalances
  lockedCelo: LockedCeloBalances
  lastUpdated: number | null
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
