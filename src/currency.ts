import { Color } from 'src/styles/Color'

export enum Currency {
  cUSD = 'cusd',
  CELO = 'celo',
}

interface CurrencyProps {
  symbol: string
  decimals: number
  minValue: number
  color: string
}

const currencyProps: Record<Currency, CurrencyProps> = {
  [Currency.cUSD]: {
    symbol: 'cUSD',
    decimals: 2,
    minValue: 0.01,
    color: Color.primaryGreen,
  },
  [Currency.CELO]: {
    symbol: 'CELO',
    decimals: 3,
    minValue: 0.001,
    color: Color.primaryGold,
  },
}

export function getCurrencyProps(currency: Currency) {
  const props = currencyProps[currency]
  if (!props) throw new Error(`Unsupported currency ${currency}`)
  return props
}

export function getOtherCurrency(currency: Currency) {
  return currency === Currency.CELO ? Currency.cUSD : Currency.CELO
}
