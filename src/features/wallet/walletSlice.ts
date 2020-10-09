import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { assert } from 'src/utils/assert'

export interface Balances {
  // All balances are represented in wei
  cUsd: string
  celo: string
  lastUpdated: number | null
}

interface Wallet {
  address: string | null
  balances: Balances
}

export const walletInitialState: Wallet = {
  address: null,
  balances: {
    cUsd: '0',
    celo: '0',
    lastUpdated: null,
  },
}

const walletSlice = createSlice({
  name: 'account',
  initialState: walletInitialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      const address = action.payload
      assert(address && address.length === 42, `Invalid address ${address}`)
      state.address = address
    },
    updateBalances: (state, action: PayloadAction<Balances>) => {
      const { cUsd, celo, lastUpdated } = action.payload
      assert(cUsd && celo && lastUpdated, `Invalid balance`)
      state.balances = action.payload
    },
  },
})

export const { setAddress, updateBalances } = walletSlice.actions
export const walletReducer = walletSlice.reducer
