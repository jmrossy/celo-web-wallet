import { LockedCeloBalances } from 'src/features/lock/types'
import { NativeTokenId, Token, TokenWithBalance } from 'src/tokens'

type NativeTokenBalances = { [t in NativeTokenId]: TokenWithBalance }

export type TokenBalances = NativeTokenBalances & Record<string, TokenWithBalance> // token id to balance in wei

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
}

export interface AddTokenParams {
  address: string
}
