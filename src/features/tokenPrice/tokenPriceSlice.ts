import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Currency } from 'src/consts'
import { PairPriceUpdate, QuoteCurrency, TokenPriceHistory } from 'src/features/tokenPrice/types'

interface TokenPrices {
  // base currency to quote currency to price list
  prices: Record<Currency, Partial<Record<QuoteCurrency, TokenPriceHistory>>>
}

export const tokenPriceInitialState: TokenPrices = {
  prices: {
    [Currency.CELO]: {},
    [Currency.cUSD]: {},
  },
}

const tokenPriceSlice = createSlice({
  name: 'tokenPrice',
  initialState: tokenPriceInitialState,
  reducers: {
    updatePairPrice: (state, action: PayloadAction<PairPriceUpdate>) => {
      const { baseCurrency, quoteCurrency, prices } = action.payload
      state.prices[baseCurrency][quoteCurrency] = prices
    },
  },
})

export const { updatePairPrice } = tokenPriceSlice.actions
export const tokenPriceReducer = tokenPriceSlice.reducer
