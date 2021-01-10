import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SendTokenParams } from 'src/features/send/sendToken'

export interface SendState {
  transaction: SendTokenParams | null
  transactionError: string | null
  transactionSigned: boolean
}

export const sendInitialState: SendState = {
  transaction: null,
  transactionError: null,
  transactionSigned: false,
}

const sendSlice = createSlice({
  name: 'send',
  initialState: sendInitialState,
  reducers: {
    sendStarted: (state, action: PayloadAction<SendTokenParams>) => {
      state.transaction = action.payload
      state.transactionError = null
      state.transactionSigned = false
    },
    sendCanceled: (state) => {
      state.transactionError = null
      state.transactionSigned = false
    },
    sendSucceeded: (state) => {
      state.transaction = null
      state.transactionError = null
      state.transactionSigned = false
    },
    sendFailed: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload
      state.transactionSigned = false
    },
    sendReset: (state) => {
      state.transaction = null
      state.transactionError = null
      state.transactionSigned = false
    },
    setTransactionSigned: (state, action: PayloadAction<boolean>) => {
      state.transactionSigned = action.payload
    },
  },
})

export const {
  sendStarted,
  sendCanceled,
  sendSucceeded,
  sendFailed,
  sendReset,
  setTransactionSigned,
} = sendSlice.actions

export const sendReducer = sendSlice.reducer
