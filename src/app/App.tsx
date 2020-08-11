import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { WelcomeScreen } from 'src/features/onboarding/WelcomeScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'
import { connectToForno } from 'src/provider/provider'

export class App extends React.Component {
  async componentDidMount() {
    await connectToForno()
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/send/*" element={<SendFormScreen />} />
          <Route path="setup/*" element={<WelcomeScreen />} />
        </Routes>
      </BrowserRouter>
    )
  }
}
