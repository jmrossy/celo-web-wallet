import { combineReducers } from '@reduxjs/toolkit'
import { monitoredSagaReducers } from 'src/app/rootSaga'
import { persistedBalancesReducer } from 'src/features/balances/balancesSlice'
import { persistedContactsReducer } from 'src/features/contacts/contactsSlice'
import { exchangeReducer } from 'src/features/exchange/exchangeSlice'
import { feedReducer } from 'src/features/feed/feedSlice'
import { feeReducer } from 'src/features/fees/feeSlice'
import { governanceReducer } from 'src/features/governance/governanceSlice'
import { lockReducer } from 'src/features/lock/lockSlice'
import { nftReducer } from 'src/features/nft/nftSlice'
import { persistedSettingsReducer } from 'src/features/settings/settingsSlice'
import { persistedTokenPriceReducer } from 'src/features/tokenPrice/tokenPriceSlice'
import { persistedTokensReducer } from 'src/features/tokens/tokensSlice'
import { txFlowReducer } from 'src/features/txFlow/txFlowSlice'
import { persistedValidatorsReducer } from 'src/features/validators/validatorsSlice'
import { persistedWalletReducer } from 'src/features/wallet/walletSlice'
import { walletConnectReducer } from 'src/features/walletConnect/walletConnectSlice'

export const rootReducer = combineReducers({
  wallet: persistedWalletReducer,
  balances: persistedBalancesReducer,
  contacts: persistedContactsReducer,
  feed: feedReducer,
  exchange: exchangeReducer,
  lock: lockReducer,
  fees: feeReducer,
  tokens: persistedTokensReducer,
  tokenPrice: persistedTokenPriceReducer,
  validators: persistedValidatorsReducer,
  governance: governanceReducer,
  nft: nftReducer,
  settings: persistedSettingsReducer,
  walletConnect: walletConnectReducer,
  txFlow: txFlowReducer,
  saga: monitoredSagaReducers,
})
