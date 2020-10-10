import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TransactionMap } from 'src/features/feed/types'

export interface TransactionFeed {
  transactions: TransactionMap
  lastUpdatedTime: number | null
  lastBlockNumber: number | null
}

export const feedInitialState: TransactionFeed = {
  transactions: {},
  lastUpdatedTime: null,
  lastBlockNumber: null,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {
    addTransactions: (
      state,
      action: PayloadAction<{
        txs: TransactionMap
        lastUpdatedTime: number
        lastBlockNumber: number
      }>
    ) => {
      state.transactions = { ...state.transactions, ...action.payload.txs }
      state.lastUpdatedTime = action.payload.lastUpdatedTime
      state.lastBlockNumber = action.payload.lastBlockNumber
    },
  },
})

export const { addTransactions } = feedSlice.actions
export const feedReducer = feedSlice.reducer
