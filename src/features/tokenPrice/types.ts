import { NativeTokenId } from 'src/tokens'

export enum ForeignQuoteCurrency {
  BTC = 'BTC',
  USD = 'USD',
  USDT = 'USDT',
}

export type QuoteCurrency = NativeTokenId | ForeignQuoteCurrency

export interface TokenPricePoint {
  timestamp: number
  dayIndex: number // An approximation of date tracking based on block numbers
  price: number
}
export type TokenPriceHistory = Array<TokenPricePoint>

export type QuoteCurrencyPriceHistory = Record<QuoteCurrency, TokenPriceHistory>
export type BaseCurrencyPriceHistory = Record<NativeTokenId, Partial<QuoteCurrencyPriceHistory>>

export interface PairPriceUpdate {
  baseCurrency: NativeTokenId
  quoteCurrency: QuoteCurrency
  prices: TokenPriceHistory
}
