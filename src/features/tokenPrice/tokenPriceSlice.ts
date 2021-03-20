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
    updatePairPrices: (state, action: PayloadAction<PairPriceUpdate[]>) => {
      for (const ppu of action.payload) {
        const { baseCurrency, quoteCurrency, prices } = ppu
        state.prices[baseCurrency] = {
          ...state.prices[baseCurrency],
          [quoteCurrency]: prices,
        }
      }
    },
  },
})

export const { updatePairPrices } = tokenPriceSlice.actions
export const tokenPriceReducer = tokenPriceSlice.reducer
