import { combineReducers } from '@reduxjs/toolkit'
import { feedReducer } from 'src/features/feed/feedSlice'
import { walletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: walletReducer,
  feed: feedReducer,
  saga: monitoredSagaReducers,
})
export type RootState = ReturnType<typeof rootReducer>
