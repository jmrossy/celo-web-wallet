import { combineReducers, Reducer } from '@reduxjs/toolkit'
import { call, spawn } from 'redux-saga/effects'
import { connectToForno } from 'src/blockchain/provider'
import { config } from 'src/config'
import {
  fetchExchangeRateActions,
  fetchExchangeRateReducer,
  fetchExchangeRateSaga,
  fetchExchangeRateSagaName,
} from 'src/features/exchange/exchangeRate'
import {
  exchangeTokenActions,
  exchangeTokenReducer,
  exchangeTokenSaga,
  exchangeTokenSagaName,
} from 'src/features/exchange/exchangeToken'
import {
  feedFetchPoller,
  fetchFeedActions,
  fetchFeedReducer,
  fetchFeedSaga,
  fetchFeedSagaName,
} from 'src/features/feed/fetch'
import {
  estimateFeeActions,
  estimateFeeReducer,
  estimateFeeSaga,
  estimateFeeSagaName,
} from 'src/features/fees/estimateFee'
import {
  pincodeActions,
  pincodeReducer,
  pincodeSaga,
  pincodeSagaName,
} from 'src/features/pincode/pincode'
import {
  sendTokenActions,
  sendTokenReducer,
  sendTokenSaga,
  sendTokenSagaName,
} from 'src/features/send/sendToken'
import {
  fetchTokenPriceActions,
  fetchTokenPriceReducer,
  fetchTokenPriceSaga,
  fetchTokenPriceSagaName,
} from 'src/features/tokenPrice/fetchPrices'
import {
  createWalletActions,
  createWalletReducer,
  createWalletSaga,
  createWalletSagaName,
} from 'src/features/wallet/createWallet'
import {
  fetchBalancesActions,
  fetchBalancesReducer,
  fetchBalancesSaga,
  fetchBalancesSagaName,
} from 'src/features/wallet/fetchBalances'
import {
  importWallet,
  importWalletActions,
  importWalletReducer,
  importWalletSaga,
  importWalletSagaName,
} from 'src/features/wallet/importWallet'
import { SagaActions, SagaState } from 'src/utils/saga'

function* init() {
  yield call(connectToForno)
  if (config.defaultAccount) {
    yield call(importWallet, config.defaultAccount)
  }
}

// All regular sagas must be included here
const sagas = [feedFetchPoller]

// All monitored sagas must be included here
export const monitoredSagas: {
  [name: string]: { saga: any; reducer: Reducer<SagaState>; actions: SagaActions }
} = {
  [createWalletSagaName]: {
    saga: createWalletSaga,
    reducer: createWalletReducer,
    actions: createWalletActions,
  },
  [fetchBalancesSagaName]: {
    saga: fetchBalancesSaga,
    reducer: fetchBalancesReducer,
    actions: fetchBalancesActions,
  },
  [sendTokenSagaName]: {
    saga: sendTokenSaga,
    reducer: sendTokenReducer,
    actions: sendTokenActions,
  },
  [fetchFeedSagaName]: {
    saga: fetchFeedSaga,
    reducer: fetchFeedReducer,
    actions: fetchFeedActions,
  },
  [exchangeTokenSagaName]: {
    saga: exchangeTokenSaga,
    reducer: exchangeTokenReducer,
    actions: exchangeTokenActions,
  },
  [pincodeSagaName]: {
    saga: pincodeSaga,
    reducer: pincodeReducer,
    actions: pincodeActions,
  },
  [importWalletSagaName]: {
    saga: importWalletSaga,
    reducer: importWalletReducer,
    actions: importWalletActions,
  },
  [estimateFeeSagaName]: {
    saga: estimateFeeSaga,
    reducer: estimateFeeReducer,
    actions: estimateFeeActions,
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
  for (const s of sagas) {
    yield spawn(s)
  }
  for (const m of Object.values(monitoredSagas)) {
    yield spawn(m.saga)
  }
}
