import { resetContacts } from '../../features/contacts/contactsSlice'
import { fetchExchangeRateActions } from '../../features/exchange/exchangeRate'
import { resetFeed } from '../../features/feed/feedSlice'
import { fetchFeedActions } from '../../features/feed/fetchFeed'
import { fetchProposalsActions } from '../../features/governance/fetchProposals'
import { resetSettings } from '../../features/settings/settingsSlice'
import { fetchTokenPriceActions } from '../../features/tokenPrice/fetchPrices'
import { resetTokenPrices } from '../../features/tokenPrice/tokenPriceSlice'
import { txFlowReset } from '../../features/txFlow/txFlowSlice'
import { fetchValidatorsActions } from '../../features/validators/fetchValidators'
import { resetValidators } from '../../features/validators/validatorsSlice'
import { fetchBalancesActions } from '../../features/wallet/balances/fetchBalances'
import { removeAllAccounts } from '../../features/wallet/manager'
import { removeWallet_v1 } from '../../features/wallet/storage_v1'
import { disconnectWcClient, resetWcClient } from '../../features/walletConnect/walletConnectSlice'
import { createMonitoredSaga } from '../../utils/saga'
import { call, put } from 'typed-redux-saga'

export function* logout() {
  yield* put(fetchFeedActions.cancel())
  yield* put(fetchBalancesActions.cancel())
  yield* put(fetchExchangeRateActions.cancel())
  yield* put(fetchTokenPriceActions.cancel())
  yield* put(fetchValidatorsActions.cancel())
  yield* put(fetchProposalsActions.cancel())

  // Remove old v1 wallet if it exists
  removeWallet_v1()

  // Remove all wallet's accounts
  yield* call(removeAllAccounts)

  // Clear all state to start fresh
  // Manually putting reset actions to the persisted reducers
  // Several attempts at using redux-persist's purge options
  // all led to different problems
  yield* put(resetContacts())
  yield* put(resetSettings())
  yield* put(resetValidators())
  yield* put(resetFeed())
  yield* put(resetTokenPrices())
  yield* put(txFlowReset())
  yield* put(disconnectWcClient())
  yield* put(resetWcClient())
}

export const {
  name: logoutSagaName,
  wrappedSaga: logoutSaga,
  reducer: logoutReducer,
  actions: logoutActions,
} = createMonitoredSaga(logout, 'logout')
