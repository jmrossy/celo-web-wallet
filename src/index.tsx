import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { App } from 'src/app/App'
import { store } from 'src/app/store'
import 'src/styles/normalize.css'

const mountNode = document.getElementById('app')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  mountNode
)
