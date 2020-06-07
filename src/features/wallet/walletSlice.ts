import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { assert } from '../../utils/assert'

export interface Balances {
  // All balances are represented in wei
  cUsd: string
  cGld: string
  lastUpdated: number | null
}

interface Wallet {
  address: string
  balances: Balances
}

export const walletInitialState: Wallet = {
  address: '0x0000000000000000000000000000000000000000',
  balances: {
    cUsd: '0',
    cGld: '0',
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
      const { cUsd, cGld, lastUpdated } = action.payload
      assert(cUsd && cGld && lastUpdated, `Invalid balance`)
      state.balances = action.payload
    },
  },
})

export const { setAddress, updateBalances } = walletSlice.actions
export const walletReducer = walletSlice.reducer
