import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PendingWithdrawal } from 'src/features/lock/types'

export interface LockState {
  pendingWithdrawals: Array<PendingWithdrawal>
}

export const lockInitialState: LockState = {
  pendingWithdrawals: [],
}

const lockSlice = createSlice({
  name: 'lock',
  initialState: lockInitialState,
  reducers: {
    setPendingWithdrawals: (state, action: PayloadAction<Array<PendingWithdrawal>>) => {
      state.pendingWithdrawals = action.payload
    },
  },
})

export const { setPendingWithdrawals } = lockSlice.actions

export const lockReducer = lockSlice.reducer
