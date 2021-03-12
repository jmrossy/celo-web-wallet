import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PairPriceUpdate, QuoteCurrency, TokenPriceHistory } from 'src/features/tokenPrice/types'
import { NativeTokenId } from 'src/tokens'

interface TokenPrices {
  // Base currency to quote currency to price list
  prices: Partial<Record<NativeTokenId, Partial<Record<QuoteCurrency, TokenPriceHistory>>>>
}

export const tokenPriceInitialState: TokenPrices = {
  // More tokens can be added here over time as needed
  prices: {},
}

const tokenPriceSlice = createSlice({
  name: 'tokenPrice',
  initialState: tokenPriceInitialState,
  reducers: {
    updatePairPrice: (state, action: PayloadAction<PairPriceUpdate>) => {
      const { baseCurrency, quoteCurrency, prices } = action.payload
      state.prices[baseCurrency] = {
        ...state.prices[baseCurrency],
        [quoteCurrency]: prices,
      }
    },
  },
})

export const { updatePairPrice } = tokenPriceSlice.actions
export const tokenPriceReducer = tokenPriceSlice.reducer
