import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NftState {
  owned: Record<Address, number[]>
  lastUpdated: number | null
}

export const nftInitialState: NftState = {
  owned: {},
  lastUpdated: null,
}

const nftSlice = createSlice({
  name: 'nft',
  initialState: nftInitialState,
  reducers: {
    updateOwnedNfts: (state, action: PayloadAction<Record<Address, number[]>>) => {
      state.owned = action.payload
      state.lastUpdated = Date.now()
    },
    resetNfts: () => nftInitialState,
  },
})

export const { updateOwnedNfts, resetNfts } = nftSlice.actions
export const nftReducer = nftSlice.reducer
