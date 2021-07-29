import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { GroupVotes, StakeEvent, ValidatorGroup } from 'src/features/validators/types'

interface ActivatableStatus {
  status: boolean
  lastUpdated: number | null
  reminderDismissed: boolean
  groupAddresses: string[] // the groups whose votes can be activated
}

interface ValidatorsState {
  validatorGroups: {
    groups: ValidatorGroup[]
    lastUpdated: number | null
  }
  groupVotes: GroupVotes
  hasActivatable: ActivatableStatus
  stakeEvents: {
    events: StakeEvent[]
    lastUpdatedTime: number | null
    lastBlockNumber: number | null
  }
}

export const validatorsInitialState: ValidatorsState = {
  validatorGroups: {
    groups: [],
    lastUpdated: null,
  },
  groupVotes: {},
  hasActivatable: {
    status: false,
    lastUpdated: null,
    reminderDismissed: false,
    groupAddresses: [],
  },
  stakeEvents: {
    events: [],
    lastUpdatedTime: null,
    lastBlockNumber: null,
  },
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
    updateHasActivatable: (state, action: PayloadAction<ActivatableStatus>) => {
      state.hasActivatable = action.payload
    },
    dismissActivatableReminder: (state) => {
      state.hasActivatable.reminderDismissed = true
    },
    addStakeEvents: (
      state,
      action: PayloadAction<{
        events: StakeEvent[]
        lastUpdatedTime: number
        lastBlockNumber: number | null
      }>
    ) => {
      const { events, lastUpdatedTime, lastBlockNumber } = action.payload
      if (events.length) state.stakeEvents.events = [...state.stakeEvents.events, ...events]
      state.stakeEvents.lastUpdatedTime = lastUpdatedTime
      state.stakeEvents.lastBlockNumber = lastBlockNumber
    },
    resetValidators: () => validatorsInitialState,
    resetValidatorForAccount: (state) => {
      state.hasActivatable = validatorsInitialState.hasActivatable
      state.groupVotes = validatorsInitialState.groupVotes
      state.stakeEvents = validatorsInitialState.stakeEvents
    },
  },
})

export const {
  updateValidatorGroups,
  updateGroupVotes,
  updateHasActivatable,
  dismissActivatableReminder,
  addStakeEvents,
  resetValidators,
  resetValidatorForAccount,
} = validatorsSlice.actions
const validatorsReducer = validatorsSlice.reducer

const validatorsPersistConfig = {
  key: 'validators',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['validatorGroups', 'groupVotes', 'hasActivatable'],
}
export const persistedValidatorsReducer = persistReducer<ReturnType<typeof validatorsReducer>>(
  validatorsPersistConfig,
  validatorsReducer
)
