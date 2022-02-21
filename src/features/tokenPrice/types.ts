export interface TokenPricePoint {
  timestamp: number
  price: number
}
export type TokenPriceHistory = Array<TokenPricePoint>

export type QuoteCurrencyPriceHistory = Partial<Record<Address, TokenPriceHistory>>
export type BaseCurrencyPriceHistory = Partial<Record<Address, QuoteCurrencyPriceHistory>>

export interface PairPriceUpdate {
  baseCurrency: Address
  quoteCurrency: Address
  prices: TokenPriceHistory
}
