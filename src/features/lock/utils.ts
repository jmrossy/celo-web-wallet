import { BigNumber } from 'ethers'
import { Balances } from 'src/features/wallet/types'

export function getTotalCelo(balances: Balances) {
  const { locked, pendingBlocked, pendingFree } = balances.lockedCelo
  const celoBalance = balances.tokens.CELO.value
  return BigNumber.from(celoBalance).add(locked).add(pendingBlocked).add(pendingFree)
}

export function getTotalUnlockedCelo(balances: Balances) {
  const { pendingBlocked, pendingFree } = balances.lockedCelo
  const celoBalance = balances.tokens.CELO.value
  return BigNumber.from(celoBalance).add(pendingBlocked).add(pendingFree)
}

export function getTotalLockedCelo(balances: Balances) {
  const { locked, pendingBlocked, pendingFree } = balances.lockedCelo
  return BigNumber.from(locked).add(pendingBlocked).add(pendingFree)
}

export function getTotalPendingCelo(balances: Balances) {
  const { pendingBlocked, pendingFree } = balances.lockedCelo
  return BigNumber.from(pendingBlocked).add(pendingFree)
}

export function hasPendingCelo(balances: Balances) {
  const { pendingBlocked, pendingFree } = balances.lockedCelo
  return BigNumber.from(pendingBlocked).gt(0) || BigNumber.from(pendingFree).gt(0)
}
