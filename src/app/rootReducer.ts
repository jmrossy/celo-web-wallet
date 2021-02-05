import { combineReducers } from '@reduxjs/toolkit'
import { exchangeReducer } from 'src/features/exchange/exchangeSlice'
import { persistedFeedReducer } from 'src/features/feed/feedSlice'
import { feeReducer } from 'src/features/fees/feeSlice'
import { lockReducer } from 'src/features/lock/lockSlice'
import { persistedSettingsReducer } from 'src/features/settings/settingsSlice'
import { tokenPriceReducer } from 'src/features/tokenPrice/tokenPriceSlice'
import { txFlowReducer } from 'src/features/txFlow/txFlowSlice'
import { persistedWalletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: persistedWalletReducer,
  feed: persistedFeedReducer,
  exchange: exchangeReducer,
  lock: lockReducer,
  fees: feeReducer,
  tokenPrice: tokenPriceReducer,
  settings: persistedSettingsReducer,
  txFlow: txFlowReducer,
  saga: monitoredSagaReducers,
})

export type RootState = ReturnType<typeof rootReducer>
