import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { Balances } from 'src/features/balances/types'
import { assert } from 'src/utils/validation'

interface BalancesState {
  accountBalances: Balances
  voterBalances: Balances | null // if account is vote signer for another, balance of voter
}

export const balancesInitialState: BalancesState = {
  accountBalances: {
    tokenAddrToValue: {},
    lockedCelo: {
      locked: '0',
      pendingBlocked: '0',
      pendingFree: '0',
    },
    lastUpdated: null,
  },
  voterBalances: null,
}

const balancesSlice = createSlice({
  name: 'balances',
  initialState: balancesInitialState,
  reducers: {
    updateBalances: (state, action: PayloadAction<Balances>) => {
      const { tokenAddrToValue, lockedCelo, lastUpdated } = action.payload
      assert(tokenAddrToValue && lockedCelo && lastUpdated, 'Invalid balance')
      state.accountBalances = action.payload
    },
    setVoterBalances: (state, action: PayloadAction<Balances | null>) => {
      state.voterBalances = action.payload
    },
    resetBalances: () => balancesInitialState,
  },
})

export const { updateBalances, setVoterBalances, resetBalances } = balancesSlice.actions
const balancesReducer = balancesSlice.reducer

const persistConfig = {
  key: 'balances',
  storage: storage,
  whitelist: ['balances'],
}

export const persistedBalancesReducer = persistReducer<ReturnType<typeof balancesReducer>>(
  persistConfig,
  balancesReducer
)
