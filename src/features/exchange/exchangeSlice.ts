import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExchangeTokenParams } from 'src/features/exchange/types';
import { ErrorState } from 'src/utils/validation';

export interface ExchangeState {
  transaction: ExchangeTokenParams | null
  inputErrors: ErrorState
  status: string | null
  isExchanging: boolean
  notification: string | null
  toCELORate: number
  transactionError: string | null
}

export const exchangeInitialState: ExchangeState = {
  transaction: null,
  inputErrors: {},
  status: null,
  isExchanging: false,
  notification: null,
  toCELORate: (1 / 10.24),    //TODO: get a real exchange rate
  transactionError: null,
}


const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: exchangeInitialState,
  reducers: {
    setErrors: (state, action: PayloadAction<ErrorState>) => {
      state.inputErrors = action.payload;
      state.status = null;
    },
    clearInputError: (state, action: PayloadAction<string | string[]>) => {
      if (!state.inputErrors) return;
      const fieldsToRemove = Array.isArray(action.payload) ? action.payload : [action.payload];
      fieldsToRemove.forEach(fieldName => {
        delete state.inputErrors[fieldName];
      });
    },
    clearInputErrors: (state) => {
      state.inputErrors = {};
    },
    changeStatus: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    confirmExchange: (state, action: PayloadAction<ExchangeTokenParams>) => {
      state.transactionError = null;  //clear out the previous error
      state.transaction = action.payload;
      state.status = "needs-confirm";
    },
    cancelExchange: (state) => {
      state.status = null;
      state.isExchanging = false;
    },
    sendExchange: (state) => {
      state.status = "confirmed";
      state.isExchanging = true;
    },
    exchangeSent: (state) => {
      state.status = null;
      state.transaction = null;
      state.inputErrors = {};
      state.isExchanging = false;
    },
    exchangeFailed: (state, action: PayloadAction<string>) => {
      state.status = null;
      state.isExchanging = false;
      state.transactionError = action.payload;
      //errors will be in the saga slice
    },
    notify: (state, action: PayloadAction<string | null>) => {
      state.notification = action.payload;
    },
  },
})

export const { changeStatus, setErrors, clearInputError, clearInputErrors, confirmExchange, cancelExchange, sendExchange, exchangeSent, exchangeFailed, notify } = exchangeSlice.actions
export const exchangeReducer = exchangeSlice.reducer