import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { assert } from '../../utils/assert'

interface Wallet {
  address: string
}

export const walletInitialState: Wallet = {
  address: '0x0000000000000000000000000000000000000000',
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
  },
})

export const { setAddress } = walletSlice.actions
export const walletReducer = walletSlice.reducer
