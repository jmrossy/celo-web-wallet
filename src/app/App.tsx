import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { WelcomeScreen } from 'src/features/onboarding/welcome/WelcomeScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'

export class App extends React.Component {
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
