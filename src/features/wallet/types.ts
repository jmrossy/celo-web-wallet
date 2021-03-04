import { LockedCeloBalances } from 'src/features/lock/types'

export interface Balances {
  // All balances are represented in wei
  cUsd: string
  celo: string
  lockedCelo: LockedCeloBalances
  lastUpdated: number | null
}
