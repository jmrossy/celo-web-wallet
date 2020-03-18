import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { assert } from '../../utils/assert'

interface Account {
  address: string
}

export const accountInitialState: Account = {
  address: '0x0000000000000000000000000000000000000000',
}

const accountSlice = createSlice({
  name: 'account',
  initialState: accountInitialState,
  reducers: {
    setAddress(state, action: PayloadAction<string>) {
      const address = action.payload
      assert(address && address.length === 42, `Invalid address ${address}`)
      state.address = address
    },
  },
})

export const { setAddress } = accountSlice.actions

export const accountReducer = accountSlice.reducer
