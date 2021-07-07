import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CeloTransaction, TransactionMap } from 'src/features/types'

export interface TransactionFeed {
  transactions: TransactionMap
  lastUpdatedTime: number | null
  lastBlockNumber: number | null
  openTransaction: string | null // hash of transaction selected from the feed
  showAdvancedDetails: boolean
}

export const feedInitialState: TransactionFeed = {
  transactions: {},
  lastUpdatedTime: null,
  lastBlockNumber: null,
  openTransaction: null,
  showAdvancedDetails: false,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {
    setTransactions: (
      state,
      action: PayloadAction<{
        txs: TransactionMap
        lastBlockNumber: number
      }>
    ) => {
      state.transactions = action.payload.txs
      state.lastBlockNumber = action.payload.lastBlockNumber
      state.lastUpdatedTime = null
      state.openTransaction = null
    },
    addTransactions: (
      state,
      action: PayloadAction<{
        txs: TransactionMap
        lastUpdatedTime: number
        lastBlockNumber: number
      }>
    ) => {
      if (Object.keys(action.payload.txs).length > 0) {
        state.transactions = { ...state.transactions, ...action.payload.txs }
      }
      state.lastUpdatedTime = action.payload.lastUpdatedTime
      state.lastBlockNumber = action.payload.lastBlockNumber
    },
    addPlaceholderTransaction: (state, action: PayloadAction<CeloTransaction>) => {
      const newTx = action.payload
      if (!state.transactions[newTx.hash]) {
        state.transactions = { ...state.transactions, [newTx.hash]: newTx }
      }
    },
    openTransaction: (state, action: PayloadAction<string | null>) => {
      if (action.payload && state.transactions[action.payload]) {
        state.openTransaction = action.payload
      } else {
        state.openTransaction = null
      }
    },
    toggleAdvancedDetails: (state) => {
      state.showAdvancedDetails = !state.showAdvancedDetails
    },
    resetFeed: () => feedInitialState,
  },
})

export const {
  setTransactions,
  addTransactions,
  addPlaceholderTransaction,
  openTransaction,
  toggleAdvancedDetails,
  resetFeed,
} = feedSlice.actions

export const feedReducer = feedSlice.reducer
