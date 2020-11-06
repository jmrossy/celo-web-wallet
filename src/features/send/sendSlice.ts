import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorState, SendTokenParams } from 'src/features/send/types';

export interface SendState {
  transaction: SendTokenParams | null
  errors: ErrorState
  status: string | null
}

export const sendInitialState: SendState = {
  transaction: null,
  errors: {},
  status: null,
}


const sendSlice = createSlice({
  name: 'send',
  initialState: sendInitialState,
  reducers: {
    setErrors: (state, action: PayloadAction<ErrorState>) => {
      state.errors = action.payload;
      state.status = null;
    },
    clearError: (state, action: PayloadAction<string | string[]>) => {
      if (!state.errors) return;
      const fieldsToRemove = Array.isArray(action.payload) ? action.payload : [action.payload];
      fieldsToRemove.forEach(fieldName => {
        delete state.errors[fieldName];
      });
    },
    clearErrors: (state) => {
      state.errors = {};
    },
    changeStatus: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    confirmTransaction: (state, action: PayloadAction<SendTokenParams>) => {
      state.transaction = action.payload;
      state.status = "needs-confirm";
    },
    cancelTransaction: (state) => {
      state.status = null;
    },
    sendTransaction: (state) => {
      state.status = "confirmed";
    },
    transactionSent: (state) => {
      state.status = null;
      state.transaction = null;
      state.errors = {};
    }
  },
})

export const { changeStatus, setErrors, clearError, clearErrors, confirmTransaction, cancelTransaction, sendTransaction } = sendSlice.actions
export const sendReducer = sendSlice.reducer