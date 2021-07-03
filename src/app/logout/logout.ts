import { resetFeed } from 'src/features/feed/feedSlice'
import { resetSettings } from 'src/features/settings/settingsSlice'
import { txFlowReset } from 'src/features/txFlow/txFlowSlice'
import { resetValidators } from 'src/features/validators/validatorsSlice'
import { removeAllAccounts } from 'src/features/wallet/manager'
import { removeWallet as removeWallet_v1 } from 'src/features/wallet/storage_v1'
import { disconnectWcClient, resetWcClient } from 'src/features/walletConnect/walletConnectSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

export function* logout() {
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
