import { TokenMap } from 'src/features/tokens/types'
import { CELO, NativeTokens, UnknownToken } from 'src/tokens'
import { areAddressesEqual, normalizeAddress } from 'src/utils/addresses'

export function isNativeTokenAddress(addr: string) {
  return Object.values(NativeTokens)
    .map((t) => t.address)
    .includes(normalizeAddress(addr))
}

export function isStableTokenAddress(addr: string) {
  return isNativeTokenAddress(addr) && !areAddressesEqual(addr, CELO.address)
}

export function getTokenByAddress(addr: string, tokens: TokenMap) {
  const normalized = normalizeAddress(addr)
  if (tokens[normalized]) return tokens[normalized]
  else return UnknownToken
}

export function hasToken(addr: string, tokens: TokenMap) {
  return !!tokens[normalizeAddress(addr)]
}
