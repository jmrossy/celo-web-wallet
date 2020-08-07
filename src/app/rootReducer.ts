import { combineReducers } from '@reduxjs/toolkit'
import { walletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({ wallet: walletReducer, saga: monitoredSagaReducers })
export type RootState = ReturnType<typeof rootReducer>
