import sagaMonitor from '@redux-saga/simple-saga-monitor'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { rootReducer } from './rootReducer'
import { rootSaga } from './rootSaga'

// TODO add monitor only in dev mode
const sagaMiddleware = createSagaMiddleware({ sagaMonitor })

const store = configureStore({
  reducer: rootReducer,
  // Disable thunk, use saga instead
  middleware: [...getDefaultMiddleware({ thunk: false }), sagaMiddleware],
})

sagaMiddleware.run(rootSaga)

export type AppDispatch = typeof store.dispatch

export default store
