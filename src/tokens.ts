import { config } from 'src/config'
import { NULL_ADDRESS } from 'src/consts'
import { Color } from 'src/styles/Color'

export interface Token {
  symbol: string
  name: string
  address: Address // contract address
  chainId: number
  decimals?: number
  color?: string
  exchangeAddress?: Address // Mento contract for token
  sortOrder?: number // for order preference in balance lists
}

export interface TokenWithBalance extends Token {
  value: string
}

export const CELO = {
  symbol: 'CELO',
  name: 'Celo Native',
  color: Color.primaryGold,
  address: config.contractAddresses.GoldToken,
  decimals: 18,
  chainId: config.chainId,
  sortOrder: 10,
}
export const cUSD = {
  symbol: 'cUSD',
  name: 'Celo Dollar',
  color: Color.primaryGreen,
  address: config.contractAddresses.StableToken,
  decimals: 18,
  chainId: config.chainId,
  exchangeAddress: config.contractAddresses.Exchange,
  sortOrder: 20,
}
export const cEUR = {
  symbol: 'cEUR',
  name: 'Celo Euro',
  color: Color.primaryGreen,
  address: config.contractAddresses.StableTokenEUR,
  decimals: 18,
  chainId: config.chainId,
  exchangeAddress: config.contractAddresses.ExchangeEUR,
  sortOrder: 30,
}
export const cREAL = {
  symbol: 'cREAL',
  name: 'Celo Brazilian Real',
  color: Color.primaryGreen,
  address: config.contractAddresses.StableTokenBRL,
  decimals: 18,
  chainId: config.chainId,
  exchangeAddress: config.contractAddresses.ExchangeBRL,
  sortOrder: 40,
}

export const NativeTokens = [CELO, cUSD, cEUR, cREAL]
export const NativeTokensByAddress: Record<Address, Token> = {
  [CELO.address]: CELO,
  [cUSD.address]: cUSD,
  [cEUR.address]: cEUR,
  [cREAL.address]: cREAL,
}
export const StableTokens = [cUSD, cEUR, cREAL]

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
