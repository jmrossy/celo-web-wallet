import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { App } from 'src/app/App'
import { Loading } from 'src/app/Loading'
import { persistor, store } from 'src/app/store'
import 'src/styles/fonts.css'
import 'src/styles/normalize.css'
import 'src/styles/scrollbar.css'

const mountNode = document.getElementById('app')
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  mountNode
)
