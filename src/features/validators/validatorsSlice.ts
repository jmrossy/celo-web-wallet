import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { GroupVotes, ValidatorGroup } from 'src/features/validators/types'

interface ValidatorsState {
  validatorGroups: {
    groups: ValidatorGroup[]
    lastUpdated: number | null
  }
  groupVotes: GroupVotes
}

export const validatorsInitialState: ValidatorsState = {
  validatorGroups: {
    groups: [],
    lastUpdated: null,
  },
  groupVotes: {},
}

const validatorsSlice = createSlice({
  name: 'validators',
  initialState: validatorsInitialState,
  reducers: {
    updateValidatorGroups: (
      state,
      action: PayloadAction<{ groups: ValidatorGroup[]; lastUpdated: number }>
    ) => {
      const { groups, lastUpdated } = action.payload
      state.validatorGroups = {
        groups,
        lastUpdated,
      }
    },
    updateGroupVotes: (state, action: PayloadAction<GroupVotes>) => {
      state.groupVotes = action.payload
    },
  },
})

export const { updateValidatorGroups, updateGroupVotes } = validatorsSlice.actions
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
