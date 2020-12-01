import { combineReducers } from '@reduxjs/toolkit'
import { exchangeReducer } from 'src/features/exchange/exchangeSlice'
import { persistedFeedReducer } from 'src/features/feed/feedSlice'
import { feeReducer } from 'src/features/fees/feeSlice'
import { sendReducer } from 'src/features/send/sendSlice'
import { settingsReducer } from 'src/features/settings/settingsSlice'
import { tokenPriceReducer } from 'src/features/tokenPrice/tokenPriceSlice'
import { persistedWalletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: persistedWalletReducer,
  feed: persistedFeedReducer,
  send: sendReducer,
  exchange: exchangeReducer,
  fees: feeReducer,
  tokenPrice: tokenPriceReducer,
  settings: settingsReducer,
  saga: monitoredSagaReducers,
})
export type RootState = ReturnType<typeof rootReducer>
