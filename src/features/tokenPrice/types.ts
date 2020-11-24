import { Currency } from 'src/consts'

export enum QuoteCurrency {
  cUSD = 'cusd',
  CELO = 'celo',
  BTC = 'btc',
  USD = 'usd',
  USDT = 'usdt',
}

// Must be ordered from oldest to newest
export type TokenPriceHistory = Array<{ timestamp: number; price: number }>

export interface PairPriceUpdate {
  baseCurrency: Currency
  quoteCurrency: QuoteCurrency
  prices: TokenPriceHistory
}
