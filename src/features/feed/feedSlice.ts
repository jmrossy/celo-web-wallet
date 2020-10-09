import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Currency } from 'src/consts'

export type TransactionMap = Record<string, TransactionFeedItem> // hash to item

export interface TransactionFeed {
  transactions: TransactionMap
  lastUpdated: number | null
}

interface TransactionFeedItem {
  hash: string
  from: string
  to: string
  token: Currency
  value: string
  blockNumber: number
  timestamp: number
  gasPrice: string
  gasUsed: string
  feeToken?: string
  gatewayFee?: string
  gatewayFeeRecipient?: string
}

export const feedInitialState: TransactionFeed = {
  transactions: {},
  lastUpdated: null,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {
    addTransactions: (state, action: PayloadAction<TransactionMap>) => {
      state.transactions = { ...state.transactions, ...action.payload }
      state.lastUpdated = Date.now()
    },
  },
})

export const { addTransactions } = feedSlice.actions
export const feedReducer = feedSlice.reducer
