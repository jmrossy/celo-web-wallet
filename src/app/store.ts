import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { PERSIST, persistReducer, persistStore, REHYDRATE } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import createSagaMiddleware from 'redux-saga'
import { rootReducer, RootState } from 'src/app/rootReducer'
import { rootSaga } from 'src/app/rootSaga'

const sagaMiddleware = createSagaMiddleware()

const persistConfig = {
  key: 'root',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['feed'], //Note, wallet is also persisted, but only partially - see rootReducer.ts
}

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer, //rootReducer,
  // Disable thunk, use saga instead
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      //redux-persist uses non-serializable actions
      serializableCheck: {
        ignoredActions: [PERSIST, REHYDRATE],
      },
    }),
    sagaMiddleware,
  ],
})

sagaMiddleware.run(rootSaga)

export const persistor = persistStore(store)
export type PersistedRootState = ReturnType<typeof persistedReducer>
export type AppDispatch = typeof store.dispatch
