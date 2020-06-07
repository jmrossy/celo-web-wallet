import sagaMonitor from '@redux-saga/simple-saga-monitor'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { config } from '../config'
import { rootReducer } from './rootReducer'
import { rootSaga } from './rootSaga'

const sagaMiddleware = createSagaMiddleware(config.debug ? { sagaMonitor } : undefined)

const store = configureStore({
  reducer: rootReducer,
  // Disable thunk, use saga instead
  middleware: [...getDefaultMiddleware({ thunk: false }), sagaMiddleware],
})

sagaMiddleware.run(rootSaga)

export type AppDispatch = typeof store.dispatch

export default store
