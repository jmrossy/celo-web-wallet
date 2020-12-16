import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'

interface settings {
  homeHeaderDismissed: boolean
  highValueWarningDismissed: boolean
  backupReminderDismissed: boolean //persisted
}

export const settingsInitialState: settings = {
  homeHeaderDismissed: false,
  highValueWarningDismissed: false,
  backupReminderDismissed: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState,
  reducers: {
    toggleHomeHeaderDismissed: (state) => {
      state.homeHeaderDismissed = !state.homeHeaderDismissed
    },
    setHighValueWarningDismissed: (state, action: PayloadAction<boolean>) => {
      state.highValueWarningDismissed = action.payload
    },
    setBackupReminderDismissed: (state, action: PayloadAction<boolean>) => {
      state.backupReminderDismissed = action.payload
    },
    resetSettingFlags: (state) => {
      state.homeHeaderDismissed = false
      state.backupReminderDismissed = false
      state.highValueWarningDismissed = false
    },
  },
})

export const {
  toggleHomeHeaderDismissed,
  setHighValueWarningDismissed,
  setBackupReminderDismissed,
  resetSettingFlags,
} = settingsSlice.actions
export const settingsReducer = settingsSlice.reducer

const settingPersistConfig = {
  key: 'setting',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['backupReminderDismissed'], //only persist this flag
}
export const persistedSettingsReducer = persistReducer<ReturnType<typeof settingsReducer>>(
  settingPersistConfig,
  settingsReducer
)
