import { config } from 'src/config'
import { NULL_ADDRESS } from 'src/consts'
import { Color } from 'src/styles/Color'

export interface Token {
  id: string
  label: string // for display, usually the same as id
  color: string
  minValue: number
  displayDecimals: number
  address: string // contract address
  decimals: number // TODO support decimals other than 18
  chainId: number
  ticker?: string // for ledger, usually the same as id except cGLD
  signature?: string
  rawData?: string
  exchangeAddress?: string // Mento contract for token
  sortOrder?: number // for order preference in balance lists
}

export interface TokenWithBalance extends Token {
  value: string
}

export enum NativeTokenId {
  CELO = 'CELO',
  cUSD = 'cUSD',
  cEUR = 'cEUR',
}

export const StableTokenIds = [NativeTokenId.cUSD, NativeTokenId.cEUR]

export interface INativeTokens {
  CELO: Token
  cUSD: Token
  cEUR: Token
}

export const NativeTokens: INativeTokens = {
  CELO: {
    id: NativeTokenId.CELO,
    label: NativeTokenId.CELO,
    color: Color.primaryGold,
    minValue: 0.001,
    displayDecimals: 3,
    address: config.contractAddresses.GoldToken,
    ticker: 'cGLD',
    decimals: 18,
    chainId: config.chainId,
    sortOrder: 3,
  },
  cUSD: {
    id: NativeTokenId.cUSD,
    label: NativeTokenId.cUSD,
    color: Color.primaryGreen,
    minValue: 0.01,
    displayDecimals: 2,
    address: config.contractAddresses.StableToken,
    decimals: 18,
    chainId: config.chainId,
    exchangeAddress: config.contractAddresses.Exchange,
    sortOrder: 1,
  },
  cEUR: {
    id: NativeTokenId.cEUR,
    label: NativeTokenId.cEUR,
    color: Color.primaryGreen,
    minValue: 0.01,
    displayDecimals: 2,
    address: config.contractAddresses.StableTokenEUR,
    decimals: 18,
    chainId: config.chainId,
    exchangeAddress: config.contractAddresses.ExchangeEUR,
    sortOrder: 2,
  },
}

export type Tokens = INativeTokens & Record<string, Token>

// Just re-export directly for convenient access
export const CELO = NativeTokens.CELO
export const cUSD = NativeTokens.cUSD
export const cEUR = NativeTokens.cEUR

export const LockedCELO: Token = {
  ...CELO,
  id: 'lockedCELO',
  label: 'Locked CELO',
  address: config.contractAddresses.LockedGold,
  sortOrder: CELO.sortOrder! + 1,
}

export const UnknownToken: Token = {
  id: 'unknown',
  label: 'Unknown',
  color: Color.textGrey,
  minValue: 0.01,
  displayDecimals: 2,
  address: NULL_ADDRESS,
  decimals: 18,
  chainId: config.chainId,
}

export function isNativeToken(tokenId: string) {
  return Object.keys(NativeTokens).includes(tokenId)
}

export function isStableToken(tokenId: string) {
  return StableTokenIds.includes(tokenId as NativeTokenId)
}

export function getTokenById(id: string, tokens: Tokens) {
  if (tokens[id]) return tokens[id]
  else return UnknownToken
}
