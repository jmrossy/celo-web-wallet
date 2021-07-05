import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createMigrate, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
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

const feedReducer = feedSlice.reducer

const migrations = {
  // Typings don't work well for migrations:
  // https://github.com/rt2zz/redux-persist/issues/1065
  0: (state: any) => {
    // Migration to reset feed due to schema change
    return {
      ...state,
      transactions: {},
      lastUpdatedTime: null,
      lastBlockNumber: null,
    }
  },
}

const feedPersistConfig = {
  key: 'feed',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['transactions', 'lastUpdatedTime', 'lastBlockNumber'],
  version: 0, // -1 is default
  migrate: createMigrate(migrations),
}

export const persistedFeedReducer = persistReducer<ReturnType<typeof feedReducer>>(
  feedPersistConfig,
  feedReducer
)
