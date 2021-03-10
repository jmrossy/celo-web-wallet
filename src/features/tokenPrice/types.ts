import { NativeTokenId } from 'src/currency'

export enum QuoteCurrency {
  cUSD = 'cUSD',
  CELO = 'CELO',
  BTC = 'BTC',
  USD = 'USD',
  USDT = 'USDT',
}

// Must be ordered from oldest to newest
export type TokenPriceHistory = Array<{ timestamp: number; price: number }>

export interface PairPriceUpdate {
  baseCurrency: NativeTokenId
  quoteCurrency: QuoteCurrency
  prices: TokenPriceHistory
}
