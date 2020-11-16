import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Currency } from 'src/consts'
import { FeeEstimate, GasPrice } from 'src/features/fees/types'

interface FeeState {
  gasPrices: Record<Currency, GasPrice | null>
  estimates: FeeEstimate[] | null
}

const feesInitialState: FeeState = {
  gasPrices: {
    [Currency.CELO]: null,
    [Currency.cUSD]: null,
  },
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
      action: PayloadAction<{ currency: Currency; value: string; lastUpdated: number }>
    ) => {
      const { currency, value, lastUpdated } = action.payload
      state.gasPrices[currency] = { value, lastUpdated }
    },
  },
})

export const { setFeeEstimate, updateGasPrice } = feeSlice.actions
export const feeReducer = feeSlice.reducer
