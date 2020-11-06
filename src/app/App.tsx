import { Component } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ExchangeConfirmationScreen } from 'src/features/exchange/ExchangeConfirmationScreen'
import { ExchangeFormScreen } from 'src/features/exchange/ExchangeFormScreen'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { ImportWalletScreen } from 'src/features/onboarding/import/ImportWalletScreen'
import { NewWalletScreen } from 'src/features/onboarding/new/NewWalletScreen'
import { SetPincodeScreen } from 'src/features/onboarding/pincode/SetPincodeScreen'
import { WelcomeScreen } from 'src/features/onboarding/welcome/WelcomeScreen'
import { SendConfirmationScreen } from 'src/features/send/SendConfirmationScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'

export class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          {/* TODO use route nesting when react-router v6 bugs are fixed */}
          <Route path="send" element={<SendFormScreen />} />
          <Route path="send-review" element={<SendConfirmationScreen />} />
          <Route path="exchange" element={<ExchangeFormScreen />} />
          <Route path="exchange-review" element={<ExchangeConfirmationScreen />} />
          <Route path="welcome" element={<WelcomeScreen />} />
          <Route path="new" element={<NewWalletScreen />} />
          <Route path="import" element={<ImportWalletScreen />} />
          <Route path="pin" element={<SetPincodeScreen />} />
        </Routes>
      </BrowserRouter>
    )
  }
}
