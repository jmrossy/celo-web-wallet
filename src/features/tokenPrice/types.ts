import { NativeTokenId } from 'src/tokens'

export enum ForeignQuoteCurrency {
  BTC = 'BTC',
  USD = 'USD',
  USDT = 'USDT',
}

export type QuoteCurrency = NativeTokenId | ForeignQuoteCurrency

// Must be ordered from oldest to newest
export type TokenPriceHistory = Array<{ timestamp: number; price: number }>

export interface PairPriceUpdate {
  baseCurrency: NativeTokenId
  quoteCurrency: QuoteCurrency
  prices: TokenPriceHistory
}
