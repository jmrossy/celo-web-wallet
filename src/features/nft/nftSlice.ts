import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { Nft, NftContract } from 'src/features/nft/types'

interface NftState {
  owned: Record<Address, Nft[]>
  lastUpdated: number | null
  customContracts: NftContract[]
}

export const nftInitialState: NftState = {
  owned: {},
  lastUpdated: null,
  customContracts: [],
}

const nftSlice = createSlice({
  name: 'nft',
  initialState: nftInitialState,
  reducers: {
    updateOwnedNfts: (state, action: PayloadAction<Record<Address, Nft[]>>) => {
      state.owned = action.payload
      state.lastUpdated = Date.now()
    },
    addCustomContract: (state, action: PayloadAction<NftContract>) => {
      state.customContracts.push(action.payload)
    },
    resetNfts: () => nftInitialState,
  },
})

export const { updateOwnedNfts, resetNfts } = nftSlice.actions
const nftReducer = nftSlice.reducer

const persistConfig = {
  key: 'nft',
  storage: storage,
  whitelist: ['owned', 'customContracts'],
}

export const persistedNftReducer = persistReducer<ReturnType<typeof nftReducer>>(
  persistConfig,
  nftReducer
)
