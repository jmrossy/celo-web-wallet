import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PendingWithdrawal } from 'src/features/lock/types'

export interface LockState {
  isAccountRegistered: boolean
  pendingWithdrawals: Array<PendingWithdrawal>
}

export const lockInitialState: LockState = {
  isAccountRegistered: false,
  pendingWithdrawals: [],
}

const lockSlice = createSlice({
  name: 'lock',
  initialState: lockInitialState,
  reducers: {
    setLockedCeloStatus: (state, action: PayloadAction<LockState>) => {
      state.isAccountRegistered = action.payload.isAccountRegistered
      state.pendingWithdrawals = action.payload.pendingWithdrawals
    },
  },
})

export const { setLockedCeloStatus } = lockSlice.actions

export const lockReducer = lockSlice.reducer
