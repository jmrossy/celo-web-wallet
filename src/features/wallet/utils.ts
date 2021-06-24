import { BigNumber, utils } from 'ethers'
import { MNEMONIC_LENGTH_MAX, MNEMONIC_LENGTH_MIN } from 'src/consts'
import { Balances } from 'src/features/wallet/types'
import { Token } from 'src/tokens'

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

export function getTokenBalance(balances: Balances, token: Token) {
  if (!balances) throw new Error('No balances provided')
  const balance = balances.tokens[token.id]
  if (!balance) new Error(`Unknown token ${token.id}`)
  return balance.value
}

export function isValidMnemonic(mnemonic: string | null | undefined) {
  if (!mnemonic) return false
  const formatted = normalizeMnemonic(mnemonic)
  const split = formatted.split(' ')
  return (
    utils.isValidMnemonic(formatted) &&
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

export function isValidMnemonicLocale(locale: string) {
	if (!locale) return false
	// Only english locales are currently supported
	if (locale !== 'en') return false
}

// Format the mnemonic to handle extra whitespace
// May need more additions here as other languages are supported
export function normalizeMnemonic(mnemonic: string) {
  if (!mnemonic) return ''
  // Trim and replace all whitespaces with a single space
  return mnemonic.trim().replace(/\s+/g, ' ')
}
