import { combineReducers } from '@reduxjs/toolkit'
import { feedReducer } from 'src/features/feed/feedSlice'
import { sendReducer } from 'src/features/send/sendSlice'
import { walletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: walletReducer,
  feed: feedReducer,
  send: sendReducer,
  saga: monitoredSagaReducers,
})
export type RootState = ReturnType<typeof rootReducer>
