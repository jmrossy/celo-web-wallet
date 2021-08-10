import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { BaseCurrencyPriceHistory, PairPriceUpdate } from 'src/features/tokenPrice/types'

interface TokenPrices {
  // Base currency to quote currency to price list
  prices: BaseCurrencyPriceHistory
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
    resetTokenPrices: () => tokenPriceInitialState,
  },
})

export const { updatePairPrices, resetTokenPrices } = tokenPriceSlice.actions
const tokenPriceReducer = tokenPriceSlice.reducer

const persistConfig = {
  key: 'tokenPrice',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['prices'], //only persist these values
}
export const persistedTokenPriceReducer = persistReducer<ReturnType<typeof tokenPriceReducer>>(
  persistConfig,
  tokenPriceReducer
)
