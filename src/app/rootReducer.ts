import { combineReducers } from '@reduxjs/toolkit'
import { exchangeReducer } from 'src/features/exchange/exchangeSlice'
import { feedReducer } from 'src/features/feed/feedSlice'
import { feeReducer } from 'src/features/fees/feeSlice'
import { sendReducer } from 'src/features/send/sendSlice'
import { tokenPriceReducer } from 'src/features/tokenPrice/tokenPriceSlice'
import { walletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: walletReducer,
  feed: feedReducer,
  send: sendReducer,
  exchange: exchangeReducer,
  fees: feeReducer,
  tokenPrice: tokenPriceReducer,
  saga: monitoredSagaReducers,
})
export type RootState = ReturnType<typeof rootReducer>
