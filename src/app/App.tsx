import * as React from 'react'
import { Header } from '../components/header/Header'
import { ImportWalletForm } from '../components/header/ImportWalletForm'
import { connectToForno } from '../features/provider/provider'

class App extends React.Component {
  async componentDidMount() {
    await connectToForno()
  }

  render() {
    return (
      <div>
        <Header />
        <ImportWalletForm />
      </div>
    )
  }
}

export default App
