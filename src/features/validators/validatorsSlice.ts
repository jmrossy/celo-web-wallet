import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ValidatorGroup } from 'src/features/validators/types'

interface ValidatorsState {
  groups: ValidatorGroup[]
}

export const validatorsInitialState: ValidatorsState = {
  groups: [],
}

const validatorsSlice = createSlice({
  name: 'validators',
  initialState: validatorsInitialState,
  reducers: {
    updateValidatorGroups: (state, action: PayloadAction<ValidatorGroup[]>) => {
      state.groups = action.payload
    },
  },
})

export const { updateValidatorGroups } = validatorsSlice.actions
export const validatorsReducer = validatorsSlice.reducer
