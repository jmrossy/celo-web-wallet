import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createMigrate, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { SignerType } from 'src/blockchain/types'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { areAddressesEqual, isValidAddress } from 'src/utils/addresses'
import { assert } from 'src/utils/validation'

interface Wallet {
  isConnected: boolean | null
  isUnlocked: boolean
  address: Address | null
  derivationPath: string | null
  type: SignerType | null
  account: AccountStatus
  // balances: Balances | null // Deprecated, do not use (TODO cleanup)
  // voterBalances: Balances | null // Deprecated, do not use (TODO cleanup)
}

interface SetAccountAction {
  address: Address
  derivationPath: string
  type: SignerType
}

// Data about status in the Account contract
interface AccountStatus {
  isRegistered: boolean
  voteSignerFor: string | null
  lastUpdated: number | null
}

export const walletInitialState: Wallet = {
  isConnected: null,
  isUnlocked: false,
  address: null,
  derivationPath: null,
  type: null,
  account: {
    isRegistered: false,
    voteSignerFor: null,
    lastUpdated: null,
  },
  // balances: null, // Deprecated, do not use (TODO cleanup)
  // voterBalances: null, // Deprecated, do not use (TODO cleanup)
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState: walletInitialState,
  reducers: {
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setAccount: (state, action: PayloadAction<SetAccountAction>) => {
      const { address, derivationPath, type } = action.payload
      state.isUnlocked = true
      assert(address && isValidAddress(address), `Invalid address ${address}`)
      assert(type === SignerType.Local || type === SignerType.Ledger, `Invalid type ${type}`)
      assert(isValidDerivationPath(derivationPath), `Invalid derivationPath ${derivationPath}`)
      if (state.address && areAddressesEqual(state.address, address)) return
      state.address = address
      state.derivationPath = derivationPath
      state.type = type
      state.account = walletInitialState.account
      // state.voterBalances = walletInitialState.voterBalances
      // state.balances = walletInitialState.balances
    },
    setAccountStatus: (state, action: PayloadAction<AccountStatus>) => {
      state.account = action.payload
    },
    setAccountIsRegistered: (state, action: PayloadAction<boolean>) => {
      state.account.isRegistered = action.payload
    },
    resetWallet: () => walletInitialState,
  },
})

export const { setIsConnected, setAccount, setAccountStatus, setAccountIsRegistered, resetWallet } =
  walletSlice.actions
const walletReducer = walletSlice.reducer

const migrations = {
  // Typings don't work well for migrations:
  // https://github.com/rt2zz/redux-persist/issues/1065
  0: (state: any) => {
    if (!state?.balance?.tokens) return state
    // Migration to fix symbol to label rename
    const tokens: any = {}
    for (const t of Object.keys(state.balances.tokens)) {
      const previous = state.balances.tokens[t]
      tokens[t] = {
        ...previous,
        symbol: previous.symbol || previous.label || '??',
      }
    }
    return {
      ...state,
      balances: {
        ...state.balances,
        tokens,
      },
    }
  },
}

const persistConfig = {
  key: 'wallet',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['address', 'balances', 'type', 'derivationPath', 'secretType', 'account'], //we don't want to persist everything in the wallet store
  version: 0, // -1 is default
  migrate: createMigrate(migrations),
}

export const persistedWalletReducer = persistReducer<ReturnType<typeof walletReducer>>(
  persistConfig,
  walletReducer
)
