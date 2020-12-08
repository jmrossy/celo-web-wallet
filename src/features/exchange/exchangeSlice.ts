import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ExchangeRate, ExchangeTokenParams } from 'src/features/exchange/types'

export interface ExchangeState {
  cUsdToCelo: ExchangeRate | null
  cUsdToUsd: ExchangeRate | null
  transaction: ExchangeTokenParams | null
  transactionError: string | null
}

export const exchangeInitialState: ExchangeState = {
  cUsdToCelo: null,
  cUsdToUsd: null,
  transaction: null,
  transactionError: null,
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
    exchangeStarted: (state, action: PayloadAction<ExchangeTokenParams>) => {
      state.transactionError = null //clear out the previous error
      state.transaction = action.payload
    },
    exchangeCanceled: (state) => {
      state.transactionError = null
    },
    exchangeSent: (state) => {
      state.transaction = null
      state.transactionError = null
    },
    exchangeFailed: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload
    },
  },
})

export const {
  setCeloExchangeRate,
  setUsdExchangeRate,
  exchangeStarted,
  exchangeCanceled,
  exchangeSent,
  exchangeFailed,
} = exchangeSlice.actions
export const exchangeReducer = exchangeSlice.reducer
