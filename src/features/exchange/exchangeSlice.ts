import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ExchangeRate } from 'src/features/exchange/types'

export interface ExchangeState {
  cUsdToCelo: ExchangeRate | null
  cUsdToUsd: ExchangeRate | null
}

export const exchangeInitialState: ExchangeState = {
  cUsdToCelo: null,
  cUsdToUsd: null,
}

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: exchangeInitialState,
  reducers: {
    setCeloExchangeRate: (state, action: PayloadAction<ExchangeRate | null>) => {
      state.cUsdToCelo = action.payload
    },
    setUsdExchangeRate: (state, action: PayloadAction<ExchangeRate | null>) => {
      state.cUsdToUsd = action.payload
    },
  },
})

export const { setCeloExchangeRate, setUsdExchangeRate } = exchangeSlice.actions

export const exchangeReducer = exchangeSlice.reducer
