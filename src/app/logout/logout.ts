import { fetchExchangeRateActions } from 'src/features/exchange/exchangeRate'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { fetchProposalsActions } from 'src/features/governance/fetchProposals'
import { resetSettings } from 'src/features/settings/settingsSlice'
import { fetchTokenPriceActions } from 'src/features/tokenPrice/fetchPrices'
import { resetTokenPrices } from 'src/features/tokenPrice/tokenPriceSlice'
import { txFlowReset } from 'src/features/txFlow/txFlowSlice'
import { fetchValidatorsActions } from 'src/features/validators/fetchValidators'
import { resetValidators } from 'src/features/validators/validatorsSlice'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { removeAllAccounts } from 'src/features/wallet/manager'
import { removeWallet_v1 } from 'src/features/wallet/storage_v1'
import { disconnectWcClient, resetWcClient } from 'src/features/walletConnect/walletConnectSlice'
import { createMonitoredSaga } from 'src/utils/saga'
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
