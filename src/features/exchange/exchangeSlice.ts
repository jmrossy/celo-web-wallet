import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ToCeloRates } from 'src/features/exchange/types'

export interface ExchangeState {
  toCeloRates: ToCeloRates
}

export const exchangeInitialState: ExchangeState = {
  toCeloRates: {},
}

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: exchangeInitialState,
  reducers: {
    setExchangeRates: (state, action: PayloadAction<ToCeloRates>) => {
      state.toCeloRates = action.payload
    },
    resetExchangeRates: () => exchangeInitialState,
  },
})

export const { setExchangeRates, resetExchangeRates } = exchangeSlice.actions

export const exchangeReducer = exchangeSlice.reducer
