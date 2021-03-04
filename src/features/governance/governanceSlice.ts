import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Proposal } from 'src/features/governance/types'

interface GovernanceState {
  proposals: Proposal[]
  lastUpdated: number | null
}

export const governanceInitialState: GovernanceState = {
  proposals: [],
  lastUpdated: null,
}

const governanceSlice = createSlice({
  name: 'governance',
  initialState: governanceInitialState,
  reducers: {
    updateProposals: (
      state,
      action: PayloadAction<{ proposals: Proposal[]; lastUpdated: number }>
    ) => {
      const { proposals, lastUpdated } = action.payload
      state.proposals = proposals
      state.lastUpdated = lastUpdated
    },
  },
})

export const { updateProposals } = governanceSlice.actions
export const governanceReducer = governanceSlice.reducer
