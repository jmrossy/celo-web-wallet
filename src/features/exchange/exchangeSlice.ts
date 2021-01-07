import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ExchangeRate, ExchangeTokenParams } from 'src/features/exchange/types'

export interface ExchangeState {
  cUsdToCelo: ExchangeRate | null
  cUsdToUsd: ExchangeRate | null
  transaction: ExchangeTokenParams | null
  transactionError: string | null
  numSignatures: number
}

export const exchangeInitialState: ExchangeState = {
  cUsdToCelo: null,
  cUsdToUsd: null,
  transaction: null,
  transactionError: null,
  numSignatures: 0,
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
    setNumSignatures: (state, action: PayloadAction<number>) => {
      state.numSignatures = action.payload
    },
    exchangeStarted: (state, action: PayloadAction<ExchangeTokenParams>) => {
      state.transactionError = null //clear out the previous error
      state.numSignatures = 0
      state.transaction = action.payload
    },
    exchangeCanceled: (state) => {
      state.transactionError = null
      state.numSignatures = 0
    },
    exchangeSent: (state) => {
      state.transaction = null
      state.transactionError = null
      state.numSignatures = 0
    },
    exchangeFailed: (state, action: PayloadAction<string | null>) => {
      state.numSignatures = 0
      state.transactionError = action.payload
    },
    exchangeReset: (state) => {
      state.transaction = null
      state.transactionError = null
      state.numSignatures = 0
    },
  },
})

export const {
  setCeloExchangeRate,
  setUsdExchangeRate,
  setNumSignatures,
  exchangeStarted,
  exchangeCanceled,
  exchangeSent,
  exchangeFailed,
  exchangeReset,
} = exchangeSlice.actions

export const exchangeReducer = exchangeSlice.reducer
