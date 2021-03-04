import { combineReducers } from '@reduxjs/toolkit'
import { exchangeReducer } from 'src/features/exchange/exchangeSlice'
import { persistedFeedReducer } from 'src/features/feed/feedSlice'
import { feeReducer } from 'src/features/fees/feeSlice'
import { governanceReducer } from 'src/features/governance/governanceSlice'
import { lockReducer } from 'src/features/lock/lockSlice'
import { persistedSettingsReducer } from 'src/features/settings/settingsSlice'
import { tokenPriceReducer } from 'src/features/tokenPrice/tokenPriceSlice'
import { txFlowReducer } from 'src/features/txFlow/txFlowSlice'
import { persistedValidatorsReducer } from 'src/features/validators/validatorsSlice'
import { persistedWalletReducer } from 'src/features/wallet/walletSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: persistedWalletReducer,
  feed: persistedFeedReducer,
  exchange: exchangeReducer,
  lock: lockReducer,
  fees: feeReducer,
  tokenPrice: tokenPriceReducer,
  validators: persistedValidatorsReducer,
  governance: governanceReducer,
  settings: persistedSettingsReducer,
  txFlow: txFlowReducer,
  saga: monitoredSagaReducers,
})

export type RootState = ReturnType<typeof rootReducer>
