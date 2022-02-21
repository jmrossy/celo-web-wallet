import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { BaseCurrencyPriceHistory, PairPriceUpdate } from 'src/features/tokenPrice/types'

interface TokenPrices {
  // Base currency to quote currency to price list
  byBaseAddress: BaseCurrencyPriceHistory
}

export const tokenPriceInitialState: TokenPrices = {
  // More tokens can be added here over time as needed
  byBaseAddress: {},
}

const tokenPriceSlice = createSlice({
  name: 'tokenPrice',
  initialState: tokenPriceInitialState,
  reducers: {
    updatePairPrices: (state, action: PayloadAction<PairPriceUpdate[]>) => {
      for (const ppu of action.payload) {
        const { baseCurrency, quoteCurrency, prices } = ppu
        state.byBaseAddress[baseCurrency] = {
          ...state.byBaseAddress[baseCurrency],
          [quoteCurrency]: prices,
        }
      }
    },
    resetTokenPrices: () => tokenPriceInitialState,
  },
})

export const { updatePairPrices, resetTokenPrices } = tokenPriceSlice.actions
const tokenPriceReducer = tokenPriceSlice.reducer

const persistConfig = {
  key: 'tokenPrice',
  storage: storage,
  whitelist: ['byBaseAddress'],
}
export const persistedTokenPriceReducer = persistReducer<ReturnType<typeof tokenPriceReducer>>(
  persistConfig,
  tokenPriceReducer
)
