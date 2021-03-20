import { NativeTokenId } from 'src/tokens'

export enum ForeignQuoteCurrency {
  BTC = 'BTC',
  USD = 'USD',
  USDT = 'USDT',
}

export type QuoteCurrency = NativeTokenId | ForeignQuoteCurrency

export interface TokenPricePoint {
  timestamp: number
  price: number
}
// Must be ordered from oldest to newest
export type TokenPriceHistory = Array<TokenPricePoint>

export interface PairPriceUpdate {
  baseCurrency: NativeTokenId
  quoteCurrency: QuoteCurrency
  prices: TokenPriceHistory
}
