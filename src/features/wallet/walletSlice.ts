import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createMigrate, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { SignerType } from 'src/blockchain/types'
import { Balances } from 'src/features/wallet/types'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { CELO, cEUR, cUSD, Token } from 'src/tokens'
import { areAddressesEqual, isValidAddress } from 'src/utils/addresses'
import { assert } from 'src/utils/validation'

interface Wallet {
  isConnected: boolean | null
  isUnlocked: boolean
  address: string | null
  derivationPath: string | null
  type: SignerType | null
  balances: Balances
  account: AccountStatus
  voterBalances: Balances | null // if account is vote signer for another, balance of voter
}

interface SetAccountAction {
  address: string
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
  balances: {
    tokens: {
      CELO: {
        ...CELO,
        value: '0',
      },
      cUSD: {
        ...cUSD,
        value: '0',
      },
      cEUR: {
        ...cEUR,
        value: '0',
      },
    },
    lockedCelo: {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    },
    lastUpdated: null,
  },
  account: {
    isRegistered: false,
    voteSignerFor: null,
    lastUpdated: null,
  },
  voterBalances: null,
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
      state.voterBalances = walletInitialState.voterBalances
      state.balances.lastUpdated = walletInitialState.balances.lastUpdated
    },
    updateBalances: (state, action: PayloadAction<Balances>) => {
      const { tokens, lockedCelo, lastUpdated } = action.payload
      assert(tokens && lockedCelo && lastUpdated, 'Invalid balance')
      state.balances = action.payload
    },
    setAccountStatus: (state, action: PayloadAction<AccountStatus>) => {
      state.account = action.payload
    },
    setAccountIsRegistered: (state, action: PayloadAction<boolean>) => {
      state.account.isRegistered = action.payload
    },
    setVoterBalances: (state, action: PayloadAction<Balances | null>) => {
      state.voterBalances = action.payload
    },
    addToken: (state, action: PayloadAction<Token>) => {
      const newToken = action.payload
      assert(newToken && newToken.id, 'No new token provided')
      assert(!state.balances.tokens[newToken.id], 'Token already exists')
      const newTokenWithValue = { ...newToken, value: '0' }
      state.balances.tokens = { ...state.balances.tokens, [newToken.id]: newTokenWithValue }
    },
    removeToken: (state, action: PayloadAction<string>) => {
      const tokenId = action.payload
      assert(state.balances.tokens[tokenId], 'Token does not exist')
      const newTokens = { ...state.balances.tokens }
      delete newTokens[tokenId]
      state.balances.tokens = newTokens
    },
    resetWallet: () => walletInitialState,
  },
})

export const {
  setIsConnected,
  setAccount,
  updateBalances,
  setAccountStatus,
  setAccountIsRegistered,
  setVoterBalances,
  addToken,
  removeToken,
  resetWallet,
} = walletSlice.actions
const walletReducer = walletSlice.reducer

const migrations = {
  // Typings don't work well for migrations:
  // https://github.com/rt2zz/redux-persist/issues/1065
  0: (state: any) => {
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
