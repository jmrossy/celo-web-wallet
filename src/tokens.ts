import { config } from 'src/config'
import { NULL_ADDRESS } from 'src/consts'
import { Color } from 'src/styles/Color'

export interface Token {
  symbol: string
  name: string
  address: string // contract address
  chainId: number
  decimals?: number // TODO support decimals other than 18 (Issue #53)
  color?: string
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
  cREAL = 'cREAL',
}

export const StableTokenIds = [NativeTokenId.cUSD, NativeTokenId.cEUR, NativeTokenId.cREAL]

export interface INativeTokens {
  CELO: Token
  cUSD: Token
  cEUR: Token
  cREAL: Token
}

export const NativeTokens: INativeTokens = {
  CELO: {
    symbol: NativeTokenId.CELO,
    name: 'Celo Native',
    color: Color.primaryGold,
    address: config.contractAddresses.GoldToken,
    decimals: 18,
    chainId: config.chainId,
    sortOrder: 3,
  },
  cUSD: {
    symbol: NativeTokenId.cUSD,
    name: 'Celo Dollar',
    color: Color.primaryGreen,
    address: config.contractAddresses.StableToken,
    decimals: 18,
    chainId: config.chainId,
    exchangeAddress: config.contractAddresses.Exchange,
    sortOrder: 1,
  },
  cEUR: {
    symbol: NativeTokenId.cEUR,
    name: 'Celo Euro',
    color: Color.primaryGreen,
    address: config.contractAddresses.StableTokenEUR,
    decimals: 18,
    chainId: config.chainId,
    exchangeAddress: config.contractAddresses.ExchangeEUR,
    sortOrder: 2,
  },
  cREAL: {
    symbol: NativeTokenId.cREAL,
    name: 'Celo Brazilian Real',
    color: Color.primaryGreen,
    address: config.contractAddresses.StableTokenBRL,
    decimals: 18,
    chainId: config.chainId,
    exchangeAddress: config.contractAddresses.ExchangeBRL,
    sortOrder: 2,
  },
}

// Just re-export directly for convenient access
export const CELO = NativeTokens.CELO
export const cUSD = NativeTokens.cUSD
export const cEUR = NativeTokens.cEUR
export const cREAL = NativeTokens.cREAL

export const LockedCELO: Token = {
  ...CELO,
  symbol: 'Locked CELO',
  name: 'Locked CELO',
  address: config.contractAddresses.LockedGold,
  sortOrder: CELO.sortOrder! + 1,
}

export const UnknownToken: Token = {
  symbol: 'unknown',
  name: 'Unknown Token',
  color: Color.textGrey,
  address: NULL_ADDRESS,
  decimals: 18,
  chainId: config.chainId,
}
