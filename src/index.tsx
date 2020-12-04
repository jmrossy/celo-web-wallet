import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { App } from 'src/app/App'
import { Loading } from 'src/app/Loading'
import { persistor, store } from 'src/app/store'
import 'src/styles/fonts.css'
import 'src/styles/normalize.css'
import 'src/styles/scrollbar.css'

//The following is to display the loader for a minimum of 2 seconds, even on fast connections
// const loader = document.querySelector('.loader')
// const hideLoader = () => loader?.classList.add('loader--hide')
// const startStr = loader?.getAttribute('data-start')
// const startTime = startStr ? parseInt(startStr) : Date.now()

const mountNode = document.getElementById('app')

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  mountNode
)
