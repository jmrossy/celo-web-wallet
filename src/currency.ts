import { config } from 'src/config'
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
  isNative?: boolean // can it pay for gas
  ticker?: string // for ledger, usually the same as id except cGLD
  signature?: string
  rawData?: string
}

export interface TokenWithBalance extends Token {
  value: string
}

export enum NativeTokenId {
  CELO = 'CELO',
  cUSD = 'cUSD',
  cEUR = 'cEUR',
}

interface INativeTokens {
  CELO: Token
  cUSD: Token
  cEUR: Token
}

export const NativeTokens: INativeTokens = {
  CELO: {
    id: 'CELO',
    label: 'CELO',
    color: Color.primaryGold,
    minValue: 0.001,
    displayDecimals: 3,
    address: config.contractAddresses.GoldToken,
    ticker: 'cGLD',
    decimals: 18,
    chainId: config.chainId,
    isNative: true,
  },
  cUSD: {
    id: 'cUSD',
    label: 'cUSD',
    color: Color.primaryGreen,
    minValue: 0.01,
    displayDecimals: 2,
    address: config.contractAddresses.StableToken,
    decimals: 18,
    chainId: config.chainId,
    isNative: true,
  },
  cEUR: {
    id: 'cEUR',
    label: 'cEUR',
    color: Color.primaryGreen,
    minValue: 0.01,
    displayDecimals: 2,
    address: config.contractAddresses.StableToken, // TODO
    decimals: 18,
    chainId: config.chainId,
    isNative: true,
  },
}

export type Tokens = INativeTokens & Record<string, Token>

// Just re-export directly for convinient access
export const CELO = NativeTokens.CELO
export const cUSD = NativeTokens.cUSD
export const cEUR = NativeTokens.cEUR

//TODO
export enum Currency {
  CELO = 'celo',
  cUSD = 'cusd',
}

// interface CurrencyProps {
//   symbol: string
//   decimals: number
//   minValue: number
//   color: string
// }

// const currencyProps: Record<Currency, CurrencyProps> = {
//   [Currency.cUSD]: {
//     symbol: 'cUSD',
//     decimals: 2,
//     minValue: 0.01,
//     color: Color.primaryGreen,
//   },
//   [Currency.CELO]: {
//     symbol: 'CELO',
//     decimals: 3,
//     minValue: 0.001,
//     color: Color.primaryGold,
//   },
// }

// export function getCurrencyProps(currency: Currency) {
//   const props = currencyProps[currency]
//   if (!props) throw new Error(`Unsupported currency ${currency}`)
//   return props
// }

// export function getOtherCurrency(currency: Currency) {
//   return currency === Currency.CELO ? Currency.cUSD : Currency.CELO
// }
