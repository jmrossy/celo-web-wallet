import * as React from 'react'
import Header from '../components/header/header'
import { connectToForno } from '../features/provider/provider'

class App extends React.Component {
  async componentDidMount() {
    await connectToForno()
  }

  render() {
    return (
      <div>
        <Header />
      </div>
    )
  }
}

export default App
