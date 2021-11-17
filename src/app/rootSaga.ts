import { combineReducers, Reducer } from '@reduxjs/toolkit'
import { call, spawn } from 'redux-saga/effects'
import { logoutActions, logoutReducer, logoutSaga, logoutSagaName } from '../app/logout/logout'
import { initProvider } from '../blockchain/init'
import {
  fetchExchangeRateActions,
  fetchExchangeRateReducer,
  fetchExchangeRateSaga,
  fetchExchangeRateSagaName,
} from '../features/exchange/exchangeRate'
import {
  exchangeTokenActions,
  exchangeTokenReducer,
  exchangeTokenSaga,
  exchangeTokenSagaName,
} from '../features/exchange/exchangeToken'
import {
  fetchFeedActions,
  fetchFeedReducer,
  fetchFeedSaga,
  fetchFeedSagaName,
} from '../features/feed/fetchFeed'
import {
  estimateFeeActions,
  estimateFeeReducer,
  estimateFeeSaga,
  estimateFeeSagaName,
} from '../features/fees/estimateFee'
import {
  fetchProposalsActions,
  fetchProposalsReducer,
  fetchProposalsSaga,
  fetchProposalsSagaName,
} from '../features/governance/fetchProposals'
import {
  governanceVoteActions,
  governanceVoteReducer,
  governanceVoteSaga,
  governanceVoteSagaName,
} from '../features/governance/governanceVote'
import {
  lockTokenActions,
  lockTokenReducer,
  lockTokenSaga,
  lockTokenSagaName,
} from '../features/lock/lockToken'
import {
  changePasswordActions,
  changePasswordReducer,
  changePasswordSaga,
  changePasswordSagaName,
} from '../features/password/changePassword'
import {
  sendTokenActions,
  sendTokenReducer,
  sendTokenSaga,
  sendTokenSagaName,
} from '../features/send/sendToken'
import {
  fetchTokenPriceActions,
  fetchTokenPriceReducer,
  fetchTokenPriceSaga,
  fetchTokenPriceSagaName,
} from '../features/tokenPrice/fetchPrices'
import {
  fetchStakeHistoryActions,
  fetchStakeHistoryReducer,
  fetchStakeHistorySaga,
  fetchStakeHistorySagaName,
} from '../features/validators/fetchStakeHistory'
import {
  fetchValidatorsActions,
  fetchValidatorsReducer,
  fetchValidatorsSaga,
  fetchValidatorsSagaName,
} from '../features/validators/fetchValidators'
import {
  stakeTokenActions,
  stakeTokenReducer,
  stakeTokenSaga,
  stakeTokenSagaName,
} from '../features/validators/stakeToken'
import {
  addTokenActions,
  addTokenReducer,
  addTokenSaga,
  addTokenSagaName,
} from '../features/wallet/balances/addToken'
import {
  fetchBalancesActions,
  fetchBalancesReducer,
  fetchBalancesSaga,
  fetchBalancesSagaName,
} from '../features/wallet/balances/fetchBalances'
import {
  editAccountActions,
  editAccountReducer,
  editAccountSaga,
  editAccountSagaName,
} from '../features/wallet/editAccount'
import {
  importAccountActions,
  importAccountReducer,
  importAccountSaga,
  importAccountSagaName,
} from '../features/wallet/importAccount'
import { walletStatusPoller } from '../features/wallet/statusPoller'
import {
  switchAccountActions,
  switchAccountReducer,
  switchAccountSaga,
  switchAccountSagaName,
} from '../features/wallet/switchAccount'
import {
  unlockWalletActions,
  unlockWalletReducer,
  unlockWalletSaga,
  unlockWalletSagaName,
} from '../features/wallet/unlockWallet'
import { watchWalletConnect } from '../features/walletConnect/init'
import { SagaActions, SagaState } from '../utils/saga'

// Things that should happen before other sagas start go here
function* init() {
  yield call(initProvider)
}

// All regular sagas must be included here
const sagas = [walletStatusPoller, watchWalletConnect]

// All monitored sagas must be included here
export const monitoredSagas: {
  [name: string]: { saga: any; reducer: Reducer<SagaState>; actions: SagaActions }
} = {
  [unlockWalletSagaName]: {
    saga: unlockWalletSaga,
    reducer: unlockWalletReducer,
    actions: unlockWalletActions,
  },
  [importAccountSagaName]: {
    saga: importAccountSaga,
    reducer: importAccountReducer,
    actions: importAccountActions,
  },
  [switchAccountSagaName]: {
    saga: switchAccountSaga,
    reducer: switchAccountReducer,
    actions: switchAccountActions,
  },
  [fetchBalancesSagaName]: {
    saga: fetchBalancesSaga,
    reducer: fetchBalancesReducer,
    actions: fetchBalancesActions,
  },
  [fetchFeedSagaName]: {
    saga: fetchFeedSaga,
    reducer: fetchFeedReducer,
    actions: fetchFeedActions,
  },
  [fetchExchangeRateSagaName]: {
    saga: fetchExchangeRateSaga,
    reducer: fetchExchangeRateReducer,
    actions: fetchExchangeRateActions,
  },
  [fetchTokenPriceSagaName]: {
    saga: fetchTokenPriceSaga,
    reducer: fetchTokenPriceReducer,
    actions: fetchTokenPriceActions,
  },
  [sendTokenSagaName]: {
    saga: sendTokenSaga,
    reducer: sendTokenReducer,
    actions: sendTokenActions,
  },
  [exchangeTokenSagaName]: {
    saga: exchangeTokenSaga,
    reducer: exchangeTokenReducer,
    actions: exchangeTokenActions,
  },
  [estimateFeeSagaName]: {
    saga: estimateFeeSaga,
    reducer: estimateFeeReducer,
    actions: estimateFeeActions,
  },
  [addTokenSagaName]: {
    saga: addTokenSaga,
    reducer: addTokenReducer,
    actions: addTokenActions,
  },
  [lockTokenSagaName]: {
    saga: lockTokenSaga,
    reducer: lockTokenReducer,
    actions: lockTokenActions,
  },
  [fetchValidatorsSagaName]: {
    saga: fetchValidatorsSaga,
    reducer: fetchValidatorsReducer,
    actions: fetchValidatorsActions,
  },
  [fetchStakeHistorySagaName]: {
    saga: fetchStakeHistorySaga,
    reducer: fetchStakeHistoryReducer,
    actions: fetchStakeHistoryActions,
  },
  [stakeTokenSagaName]: {
    saga: stakeTokenSaga,
    reducer: stakeTokenReducer,
    actions: stakeTokenActions,
  },
  [fetchProposalsSagaName]: {
    saga: fetchProposalsSaga,
    reducer: fetchProposalsReducer,
    actions: fetchProposalsActions,
  },
  [governanceVoteSagaName]: {
    saga: governanceVoteSaga,
    reducer: governanceVoteReducer,
    actions: governanceVoteActions,
  },
  [editAccountSagaName]: {
    saga: editAccountSaga,
    reducer: editAccountReducer,
    actions: editAccountActions,
  },
  [changePasswordSagaName]: {
    saga: changePasswordSaga,
    reducer: changePasswordReducer,
    actions: changePasswordActions,
  },
  [logoutSagaName]: {
    saga: logoutSaga,
    reducer: logoutReducer,
    actions: logoutActions,
  },
}

type MonitoredSagaReducer = Reducer<Record<string, SagaState>>
export const monitoredSagaReducers: MonitoredSagaReducer = combineReducers(
  Object.keys(monitoredSagas).reduce(
    (acc: { [name: string]: Reducer<SagaState> }, sagaName: string) => {
      acc[sagaName] = monitoredSagas[sagaName].reducer
      return acc
    },
    {}
  )
)

export function* rootSaga() {
  yield spawn(init)
  for (const m of Object.values(monitoredSagas)) {
    yield spawn(m.saga)
  }
  for (const s of sagas) {
    yield spawn(s)
  }
}
