import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { SignerType } from 'src/blockchain/signer'
import { Balances } from 'src/features/wallet/types'
import { assert } from 'src/utils/validation'

interface Wallet {
  address: string | null
  type: SignerType | null
  derivationPath: string | null
  balances: Balances
  isUnlocked: boolean
}

export const walletInitialState: Wallet = {
  address: null,
  type: null,
  derivationPath: null,
  balances: {
    cUsd: '0',
    celo: '0',
    lastUpdated: null,
  },
  isUnlocked: false,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState: walletInitialState,
  reducers: {
    setAddress: (
      state,
      action: PayloadAction<{ address: string; type: SignerType; derivationPath: string }>
    ) => {
      const { address, type, derivationPath } = action.payload
      assert(address && address.length === 42, `Invalid address ${address}`)
      assert(type === SignerType.Local || type === SignerType.Ledger, `Invalid type ${address}`)
      assert(
        derivationPath && derivationPath.length >= 19,
        `Invalid derivation path ${derivationPath}`
      )
      state.address = address
      state.type = type
      state.derivationPath = derivationPath
    },
    updateBalances: (state, action: PayloadAction<Balances>) => {
      const { cUsd, celo, lastUpdated } = action.payload
      assert(cUsd && celo && lastUpdated, `Invalid balance`)
      state.balances = action.payload
    },
    setWalletUnlocked: (state, action: PayloadAction<boolean>) => {
      state.isUnlocked = action.payload
    },
    clearWallet: (state) => {
      state.address = walletInitialState.address
      state.balances = walletInitialState.balances
      state.isUnlocked = false
    },
  },
})

export const { setAddress, updateBalances, setWalletUnlocked, clearWallet } = walletSlice.actions
export const walletReducer = walletSlice.reducer

const walletPersistConfig = {
  key: 'wallet',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['address', 'balances', 'type', 'derivationPath'], //we don't want to persist everything in the wallet store
}
export const persistedWalletReducer = persistReducer<ReturnType<typeof walletReducer>>(
  walletPersistConfig,
  walletReducer
)
