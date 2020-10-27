import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TransactionMap } from 'src/features/feed/types'

export interface TransactionFeed {
  transactions: TransactionMap
  lastUpdatedTime: number | null
  lastBlockNumber: number | null
  openTransaction: string | null // hash of transaction selected from the feed
}

export const feedInitialState: TransactionFeed = {
  transactions: {},
  lastUpdatedTime: null,
  lastBlockNumber: null,
  openTransaction: null,
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
    openTransaction: (state, action: PayloadAction<string | null>) => {
      if (action.payload && state.transactions[action.payload]) {
        state.openTransaction = action.payload
      } else {
        state.openTransaction = null
      }
    },
  },
})

export const { addTransactions, openTransaction } = feedSlice.actions
export const feedReducer = feedSlice.reducer
