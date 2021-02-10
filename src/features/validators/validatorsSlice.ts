import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { ValidatorGroup } from 'src/features/validators/types'

interface ValidatorsState {
  groups: ValidatorGroup[]
  lastUpdated: number | null
}

export const validatorsInitialState: ValidatorsState = {
  groups: [],
  lastUpdated: null,
}

const validatorsSlice = createSlice({
  name: 'validators',
  initialState: validatorsInitialState,
  reducers: {
    updateValidatorGroups: (
      state,
      action: PayloadAction<{ groups: ValidatorGroup[]; lastUpdated: number }>
    ) => {
      state.groups = action.payload.groups
      state.lastUpdated = action.payload.lastUpdated
    },
    resetValidatorGroups: (state) => {
      state.groups = []
    },
  },
})

export const { updateValidatorGroups, resetValidatorGroups } = validatorsSlice.actions
const validatorsReducer = validatorsSlice.reducer

const validatorsPersistConfig = {
  key: 'validators',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['groups', 'lastUpdated'],
}
export const persistedValidatorsReducer = persistReducer<ReturnType<typeof validatorsReducer>>(
  validatorsPersistConfig,
  validatorsReducer
)
