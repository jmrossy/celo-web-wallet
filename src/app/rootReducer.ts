import { combineReducers } from '@reduxjs/toolkit'
import { persistedContactsReducer } from '../features/contacts/contactsSlice'
import { exchangeReducer } from '../features/exchange/exchangeSlice'
import { feedReducer } from '../features/feed/feedSlice'
import { feeReducer } from '../features/fees/feeSlice'
import { governanceReducer } from '../features/governance/governanceSlice'
import { lockReducer } from '../features/lock/lockSlice'
import { persistedSettingsReducer } from '../features/settings/settingsSlice'
import { persistedTokenPriceReducer } from '../features/tokenPrice/tokenPriceSlice'
import { txFlowReducer } from '../features/txFlow/txFlowSlice'
import { persistedValidatorsReducer } from '../features/validators/validatorsSlice'
import { persistedWalletReducer } from '../features/wallet/walletSlice'
import { walletConnectReducer } from '../features/walletConnect/walletConnectSlice'
import { monitoredSagaReducers } from './rootSaga'

export const rootReducer = combineReducers({
  wallet: persistedWalletReducer,
  contacts: persistedContactsReducer,
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
