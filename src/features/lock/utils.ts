import { BigNumber } from 'ethers'
import { BalancesWithTokens } from 'src/features/balances/types'

export function getTotalCelo(balances: BalancesWithTokens) {
  const { locked, pendingBlocked, pendingFree } = balances.lockedCelo
  const celoBalance = balances.tokens.CELO.value
  return BigNumber.from(celoBalance).add(locked).add(pendingBlocked).add(pendingFree)
}

export function getTotalUnlockedCelo(balances: BalancesWithTokens) {
  const { pendingBlocked, pendingFree } = balances.lockedCelo
  const celoBalance = balances.tokens.CELO.value
  return BigNumber.from(celoBalance).add(pendingBlocked).add(pendingFree)
}

export function getTotalLockedCelo(balances: BalancesWithTokens) {
  const { locked, pendingBlocked, pendingFree } = balances.lockedCelo
  return BigNumber.from(locked).add(pendingBlocked).add(pendingFree)
}

export function getTotalPendingCelo(balances: BalancesWithTokens) {
  const { pendingBlocked, pendingFree } = balances.lockedCelo
  return BigNumber.from(pendingBlocked).add(pendingFree)
}

export function hasPendingCelo(balances: BalancesWithTokens) {
  const { pendingBlocked, pendingFree } = balances.lockedCelo
  return BigNumber.from(pendingBlocked).gt(0) || BigNumber.from(pendingFree).gt(0)
}
