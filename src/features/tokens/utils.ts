import { TokenMap } from 'src/features/tokens/types'
import { CELO, NativeTokensByAddress, Token, UnknownToken } from 'src/tokens'
import { areAddressesEqual, isValidAddress, normalizeAddress } from 'src/utils/addresses'

export function isNativeTokenAddress(addr: string) {
  if (!isValidAddress(addr)) return false
  return !!NativeTokensByAddress[normalizeAddress(addr)]
}

export function getNativeToken(addr?: string | null): Token | null {
  if (!addr) return null
  return NativeTokensByAddress[normalizeAddress(addr)] ?? null
}

export function isNativeToken(token: Token) {
  return isNativeTokenAddress(token.address)
}

export function isStableTokenAddress(addr: string) {
  return isNativeTokenAddress(addr) && !areAddressesEqual(addr, CELO.address)
}

export function isStableToken(token: Token) {
  return isStableTokenAddress(token.address)
}

// Note: tokenId used to be symbol but was changed to be
// address, which is more robust. So this checks both.
export function getTokenById(id: string, tokens: TokenMap) {
  if (isValidAddress(id)) {
    return getTokenByAddress(id, tokens)
  } else {
    return getTokenBySymbol(id, tokens)
  }
}

export function getNativeTokenById(id: string) {
  return getTokenById(id, NativeTokensByAddress)
}

export function getTokenByAddress(addr: string, tokens: TokenMap) {
  const normalized = normalizeAddress(addr)
  if (tokens[normalized]) return tokens[normalized]
  else return UnknownToken
}

export function getTokenBySymbol(symbol: string, tokens: TokenMap) {
  const token = Object.values(tokens).find((t) => t.symbol.toLowerCase() === symbol.toLowerCase())
  if (token) return token
  else return UnknownToken
}

export function hasToken(addr: string, tokens: TokenMap) {
  return !!tokens[normalizeAddress(addr)]
}
