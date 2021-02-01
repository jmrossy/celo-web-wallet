import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TxFlowTransaction } from 'src/features/txFlow/types'

export interface TxFlowState {
  transaction: TxFlowTransaction | null
  transactionError: string | null
  numSignatures: number
}

export const txFlowInitialState: TxFlowState = {
  transaction: null,
  transactionError: null,
  numSignatures: 0,
}

const txFlowSlice = createSlice({
  name: 'txFlow',
  initialState: txFlowInitialState,
  reducers: {
    setNumSignatures: (state, action: PayloadAction<number>) => {
      state.numSignatures = action.payload
    },
    txFlowStarted: (state, action: PayloadAction<TxFlowTransaction>) => {
      state.transactionError = null
      state.numSignatures = 0
      state.transaction = action.payload
    },
    txFlowCanceled: (state) => {
      state.transactionError = null
      state.numSignatures = 0
    },
    txFlowSent: (state) => {
      state.transaction = null
      state.transactionError = null
      state.numSignatures = 0
    },
    txFlowFailed: (state, action: PayloadAction<string | null>) => {
      state.numSignatures = 0
      state.transactionError = action.payload
    },
    txFlowReset: (state) => {
      state.transaction = null
      state.transactionError = null
      state.numSignatures = 0
    },
  },
})

export const {
  setNumSignatures,
  txFlowStarted,
  txFlowCanceled,
  txFlowSent,
  txFlowFailed,
  txFlowReset,
} = txFlowSlice.actions

export const txFlowReducer = txFlowSlice.reducer
