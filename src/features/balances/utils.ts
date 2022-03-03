import { BigNumber } from 'ethers'
import { Balances, TokenBalances } from 'src/features/balances/types'
import { Token } from 'src/tokens'
import { logger } from 'src/utils/logger'

export function areBalancesEmpty(balances: Balances) {
  let totalBalance = BigNumber.from(0)
  for (const tokenBalance of Object.values(balances.tokenAddrToValue)) {
    totalBalance = totalBalance.add(tokenBalance)
  }
  const { locked, pendingBlocked, pendingFree } = balances.lockedCelo
  totalBalance = totalBalance.add(locked).add(pendingBlocked).add(pendingFree)
  return totalBalance.eq(0)
}

// Does the balance have at least minValue of any token
export function hasMinTokenBalance(minValue: string, balances: Balances) {
  const minValueBn = BigNumber.from(minValue)
  for (const tokenBalance of Object.values(balances.tokenAddrToValue)) {
    if (minValueBn.lte(tokenBalance)) return true
  }
  return false
}

export function getTokenBalance(balances: Balances, token: Token) {
  if (!balances) throw new Error('No balances provided')
  if (!token) throw new Error('No token provided')
  const balance = balances.tokenAddrToValue[token.address]
  if (!balance) {
    logger.error('Cannot get balance for unknown token', token.symbol, token.address)
    return '0'
  }
  return balance
}

export function getSortedTokenBalances(tokenBalances: TokenBalances) {
  return Object.values(tokenBalances).sort((t1, t2) => {
    const t1Value = BigNumber.from(t1.value)
    const t2Value = BigNumber.from(t2.value)
    if (t1Value.gt(t2Value)) return -1
    if (t1Value.lt(t2Value)) return 1
    const t1Sort = t1.sortOrder ?? 1000
    const t2Sort = t2.sortOrder ?? 1000
    if (t1Sort < t2Sort) return -1
    if (t1Sort > t2Sort) return 1
    return t1.symbol < t2.symbol ? -1 : 1
  })
}
