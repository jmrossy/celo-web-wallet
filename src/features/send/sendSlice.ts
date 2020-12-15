import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SendTokenParams } from 'src/features/send/sendToken'

export interface SendState {
  transaction: SendTokenParams | null
  transactionError: string | null
}

export const sendInitialState: SendState = {
  transaction: null,
  transactionError: null,
}

const sendSlice = createSlice({
  name: 'send',
  initialState: sendInitialState,
  reducers: {
    sendStarted: (state, action: PayloadAction<SendTokenParams>) => {
      state.transaction = action.payload
      state.transactionError = null
    },
    sendCanceled: (state) => {
      state.transactionError = null
    },
    sendSucceeded: (state) => {
      state.transaction = null
      state.transactionError = null
    },
    sendFailed: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload
    },
    sendReset: (state) => {
      state.transaction = null
      state.transactionError = null
    },
  },
})

export const { sendStarted, sendCanceled, sendSucceeded, sendFailed, sendReset } = sendSlice.actions
export const sendReducer = sendSlice.reducer
