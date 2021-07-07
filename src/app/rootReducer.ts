import { combineReducers } from '@reduxjs/toolkit'
import { exchangeReducer } from 'src/features/exchange/exchangeSlice'
import { feedReducer } from 'src/features/feed/feedSlice'
import { feeReducer } from 'src/features/fees/feeSlice'
import { governanceReducer } from 'src/features/governance/governanceSlice'
import { lockReducer } from 'src/features/lock/lockSlice'
import { persistedSettingsReducer } from 'src/features/settings/settingsSlice'
import { persistedTokenPriceReducer } from 'src/features/tokenPrice/tokenPriceSlice'
import { txFlowReducer } from 'src/features/txFlow/txFlowSlice'
import { persistedValidatorsReducer } from 'src/features/validators/validatorsSlice'
import { persistedWalletReducer } from 'src/features/wallet/walletSlice'
import { walletConnectReducer } from 'src/features/walletConnect/walletConnectSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: persistedWalletReducer,
  feed: feedReducer,
  exchange: exchangeReducer,
  lock: lockReducer,
  fees: feeReducer,
  tokenPrice: persistedTokenPriceReducer,
  validators: persistedValidatorsReducer,
  governance: governanceReducer,
  settings: persistedSettingsReducer,
  walletConnect: walletConnectReducer,
  txFlow: txFlowReducer,
  saga: monitoredSagaReducers,
})

export type RootState = ReturnType<typeof rootReducer>
