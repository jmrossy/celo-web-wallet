import { TokenWithBalance } from 'src/currency'
import { LockedCeloBalances } from 'src/features/lock/types'

export type TokenBalances = Record<string, TokenWithBalance> // token id to balance in wei

export interface Balances {
  // All balances are represented in wei
  tokens: TokenBalances
  lockedCelo: LockedCeloBalances
  lastUpdated: number | null
}

export interface BalanceTableRow {
  id: string
  token: string
  balance: string
  balanceWei: string
  contractAddress: string
}
