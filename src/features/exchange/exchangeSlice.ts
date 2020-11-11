import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExchangeTokenParams } from 'src/features/exchange/exchangeToken';
import { SagaError } from 'src/utils/saga';

//TODO: Get the real exchange rate
const TEMP_EXCHANGE_RATE = 10.24;

export interface ExchangeState {
  transaction: ExchangeTokenParams | null
  toCELORate: number
  transactionError: SagaError | string | number | null  //to have one place for an error 
}

export const exchangeInitialState: ExchangeState = {
  transaction: null,
  toCELORate: (1 / TEMP_EXCHANGE_RATE),
  transactionError: null,
}


const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: exchangeInitialState,
  reducers: {
    exchangeStarted: (state, action: PayloadAction<ExchangeTokenParams>) => {
      state.transactionError = null;  //clear out the previous error
      state.transaction = action.payload;
    },
    exchangeCanceled: (state) => {
      state.transactionError = null;
    },
    exchangeSent: (state) => {
      state.transaction = null;
      state.transactionError = null;
    },
    exchangeFailed: (state, action: PayloadAction<SagaError | string | number>) => {
      state.transactionError = action.payload;
    },
  },
})

export const { exchangeStarted, exchangeCanceled, exchangeSent, exchangeFailed } = exchangeSlice.actions
export const exchangeReducer = exchangeSlice.reducer