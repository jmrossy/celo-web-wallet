import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SendTokenParams } from 'src/features/send/sendToken';
import { SagaError } from 'src/utils/saga';

export interface SendState {
  transaction: SendTokenParams | null
  transactionError: SagaError | string | number | null
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
      state.transaction = action.payload;
      state.transactionError = null;
    },
    sendCanceled: (state) => {
      state.transactionError = null;
    },
    sendSucceeded: (state) => {
      state.transaction = null;
      state.transactionError = null;
    },
    sendFailed: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload;
    },
  },
})

export const { sendStarted, sendCanceled, sendSucceeded, sendFailed } = sendSlice.actions
export const sendReducer = sendSlice.reducer