import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { App } from 'src/app/App'
import { store } from 'src/app/store'
import 'src/styles/fonts.css'
import 'src/styles/normalize.css'
import 'src/styles/scrollbar.css'

const mountNode = document.getElementById('app')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  mountNode
)
