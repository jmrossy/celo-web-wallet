import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FeeEstimate, GasPrice } from 'src/features/fees/types'

interface FeeState {
  gasPrices: Record<Address, GasPrice | null>
  estimates: FeeEstimate[] | null
}

const feesInitialState: FeeState = {
  gasPrices: {},
  estimates: null,
}

const feeSlice = createSlice({
  name: 'fees',
  initialState: feesInitialState,
  reducers: {
    setFeeEstimate: (state, action: PayloadAction<FeeEstimate[] | null>) => {
      state.estimates = action.payload
    },
    updateGasPrice: (
      state,
      action: PayloadAction<{ feeToken: Address; value: string; lastUpdated: number }>
    ) => {
      const { feeToken, value, lastUpdated } = action.payload
      state.gasPrices[feeToken] = { value, lastUpdated }
    },
  },
})

export const { setFeeEstimate, updateGasPrice } = feeSlice.actions
export const feeReducer = feeSlice.reducer
