import { logoutSagaName } from 'src/app/logout/logout'
import type { RootState } from 'src/app/rootReducer'
import { isSignerSet } from 'src/blockchain/signer'
import { STATUS_POLLER_DELAY } from 'src/consts'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { importAccountSagaName } from 'src/features/wallet/importAccount'
import { switchAccountSagaName } from 'src/features/wallet/switchAccount'
import { unlockWalletSagaName } from 'src/features/wallet/unlockWallet'
import { SagaState, SagaStatus } from 'src/utils/saga'
import { delay, put, select } from 'typed-redux-saga'

// If any of these is running while poller would have fetched, skip
const SAGA_EXCLUSION_LIST = [
  unlockWalletSagaName,
  importAccountSagaName,
  switchAccountSagaName,
  logoutSagaName,
]

// Triggers fetching of feed and balance updates
export function* walletStatusPoller() {
  let i = 0
  while (true) {
    yield* delay(STATUS_POLLER_DELAY)
    if (!isSignerSet()) continue
    const monitoredSagaStates = yield* select((s: RootState) => s.saga)
    if (isExcludedSagaRunning(monitoredSagaStates)) continue
    yield* put(fetchFeedActions.trigger())
    if (i === 2) yield* put(fetchBalancesActions.trigger())
    i = (i + 1) % 3
  }
}

function isExcludedSagaRunning(sagaStates: Record<string, SagaState>) {
  for (const sagaName of Object.keys(sagaStates)) {
    if (!SAGA_EXCLUSION_LIST.includes(sagaName)) continue
    const sagaStatus = sagaStates[sagaName].status
    if (sagaStatus === SagaStatus.Started) return true
  }
  return false
}
