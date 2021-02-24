import { clearContractCache } from 'src/blockchain/contracts'
import { clearSigner } from 'src/blockchain/signer'
import { resetFeed } from 'src/features/feed/feedSlice'
import { resetSettings } from 'src/features/settings/settingsSlice'
import { resetValidators } from 'src/features/validators/validatorsSlice'
import { removeWallet } from 'src/features/wallet/storage'
import { resetWallet } from 'src/features/wallet/walletSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

export function* logout() {
  yield* call(removeWallet)
  // Manually putting reset actions to the persisted reducers
  // Several attempts at using redux-persist's purge options
  // all led to different problems
  yield* put(resetWallet())
  yield* put(resetSettings())
  yield* put(resetValidators())
  yield* put(resetFeed())
  clearContractCache()
  clearSigner()
}

export const {
  name: logoutSagaName,
  wrappedSaga: logoutSaga,
  reducer: logoutReducer,
  actions: logoutActions,
} = createMonitoredSaga(logout, 'logout')
