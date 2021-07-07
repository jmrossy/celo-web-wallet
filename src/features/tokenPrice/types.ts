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
export type TokenPriceHistory = Array<TokenPricePoint>

export type QuoteCurrencyPriceHistory = Partial<Record<QuoteCurrency, TokenPriceHistory>>
export type BaseCurrencyPriceHistory = Partial<Record<NativeTokenId, QuoteCurrencyPriceHistory>>

export interface PairPriceUpdate {
  baseCurrency: NativeTokenId
  quoteCurrency: QuoteCurrency
  prices: TokenPriceHistory
}
