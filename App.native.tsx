import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { InternalApp } from './src/app/InternalApp'
import { persistor, store } from './src/app/store'
import React from 'react'
// import 'src/styles/fonts.css'
// import 'src/styles/normalize.css'
// import 'src/styles/scrollbar.css'

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <InternalApp />
      </PersistGate>
    </Provider>
  )
}
