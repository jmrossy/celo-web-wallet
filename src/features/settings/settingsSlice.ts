import { createSlice } from '@reduxjs/toolkit'

interface settings {
  homeHeaderDismissed: boolean
}

export const settingsInitialState: settings = {
  homeHeaderDismissed: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState,
  reducers: {
    toggleHomeHeaderDismissed: (state) => {
      state.homeHeaderDismissed = !state.homeHeaderDismissed
    },
  },
})

export const { toggleHomeHeaderDismissed } = settingsSlice.actions
export const settingsReducer = settingsSlice.reducer
