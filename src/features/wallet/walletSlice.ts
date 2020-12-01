import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
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
  isUnlocked: boolean
  isChangingPin: boolean
}

export const walletInitialState: Wallet = {
  address: null,
  balances: {
    cUsd: '0',
    celo: '0',
    lastUpdated: null,
  },
  isUnlocked: false,
  isChangingPin: false,
}

const walletSlice = createSlice({
  name: 'wallet',
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
    setChangingPin: (state, action: PayloadAction<boolean>) => {
      state.isChangingPin = action.payload
    },
    setWalletUnlocked: (state, action: PayloadAction<boolean>) => {
      state.isUnlocked = action.payload
    },
    clearWallet: (state) => {
      state.address = walletInitialState.address
      state.balances = walletInitialState.balances
      state.isUnlocked = false
      state.isChangingPin = false
    },
  },
})

export const {
  setAddress,
  updateBalances,
  setChangingPin,
  setWalletUnlocked,
  clearWallet,
} = walletSlice.actions
export const walletReducer = walletSlice.reducer

const walletPersistConfig = {
  key: 'wallet',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['address', 'balances'], //we don't want to persist everything in the wallet store
}
export const persistedWalletReducer = persistReducer<ReturnType<typeof walletReducer>>(
  walletPersistConfig,
  walletReducer
)
