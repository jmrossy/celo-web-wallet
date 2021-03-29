import { createSelector } from '@reduxjs/toolkit'
import { BigNumber, utils } from 'ethers'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { MNEMONIC_LENGTH_MAX, MNEMONIC_LENGTH_MIN, NULL_ADDRESS } from 'src/consts'
import { Balances } from 'src/features/wallet/types'
import { Token } from 'src/tokens'
import { select } from 'typed-redux-saga'

const balanceEmptySelector = createSelector(
  (s: RootState) => s.wallet.balances,
  (balances) => areBalancesEmpty(balances)
)

export function useAreBalancesEmpty() {
  const isEmpty = useSelector(balanceEmptySelector)
  return isEmpty
}

export function areBalancesEmpty(balances: Balances) {
  let totalBalance = BigNumber.from(0)
  for (const token of Object.values(balances.tokens)) {
    totalBalance = totalBalance.add(token.value)
  }
  const { locked, pendingBlocked, pendingFree } = balances.lockedCelo
  totalBalance = totalBalance.add(locked).add(pendingBlocked).add(pendingFree)
  return totalBalance.eq(0)
}

// Does the balance have at least minValue of any token
export function hasMinTokenBalance(minValue: string, balances: Balances) {
  const minValueBn = BigNumber.from(minValue)
  for (const token of Object.values(balances.tokens)) {
    if (minValueBn.lte(token.value)) return true
  }
  return false
}

export function useTokens() {
  return useSelector((s: RootState) => s.wallet.balances.tokens)
}

export function useIsVoteSignerAccount() {
  const voteSignerFor = useSelector((s: RootState) => s.wallet.account.voteSignerFor)
  return !!voteSignerFor
}

export function useVoterBalances() {
  const { balances, account, voterBalances } = useSelector((s: RootState) => s.wallet)
  if (account.voteSignerFor && voterBalances) return { balances, voterBalances }
  else return { balances, voterBalances: balances }
}

export function* getVoterBalances() {
  const { balances, voterBalances } = yield* select((state: RootState) => state.wallet)
  if (voterBalances) return { balances, voterBalances }
  else return { balances, voterBalances: balances }
}

export function useWalletAddress() {
  const address = useSelector((s: RootState) => s.wallet.address)
  return address || NULL_ADDRESS
}

export function useVoterAccountAddress() {
  const { address, account } = useSelector((s: RootState) => s.wallet)
  return account.voteSignerFor ?? address ?? NULL_ADDRESS
}

export function* getVoterAccountAddress() {
  const { address, account } = yield* select((state: RootState) => state.wallet)
  if (!address || !account.lastUpdated)
    throw new Error('Attempting to select vote signer before wallet is initialized')
  return account.voteSignerFor ?? address
}

export function getTokenBalance(balances: Balances, token: Token) {
  if (!balances) throw new Error('No balances provided')
  const balance = balances.tokens[token.id]
  if (!balance) new Error(`Unknown token ${token.id}`)
  return balance.value
}

export function isValidMnemonic(mnemonic: string) {
  if (!mnemonic) return false
  const trimmed = mnemonic.trim()
  const split = trimmed.split(' ')
  return (
    utils.isValidMnemonic(trimmed) &&
    split.length >= MNEMONIC_LENGTH_MIN &&
    split.length <= MNEMONIC_LENGTH_MAX
  )
}

export function isValidDerivationPath(derivationPath: string) {
  if (!derivationPath) return false
  const split = derivationPath.trim().split('/')
  // TODO validate each path segment individually here
  return split[0] === 'm' && split.length === 6
}
