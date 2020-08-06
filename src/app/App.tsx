import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomeScreen } from '../features/home/homeScreen'
import { WelcomeScreen } from '../features/onboarding/WelcomeScreen'
import { connectToForno } from '../features/provider/provider'

class App extends React.Component {
  async componentDidMount() {
    await connectToForno()
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="setup/*" element={<WelcomeScreen />} />
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App
