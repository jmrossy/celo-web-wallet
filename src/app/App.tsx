import { Component } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SplashScreen } from 'src/app/SplashScreen'
import { ExchangeConfirmationScreen } from 'src/features/exchange/ExchangeConfirmationScreen'
import { ExchangeFormScreen } from 'src/features/exchange/ExchangeFormScreen'
import { HomeFrame } from 'src/features/home/HomeFrame'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { TransactionReview } from 'src/features/home/TransactionReview'
import { ImportWalletScreen } from 'src/features/onboarding/import/ImportWalletScreen'
import { NewWalletScreen } from 'src/features/onboarding/new/NewWalletScreen'
import { SetPincodeScreen } from 'src/features/onboarding/pincode/SetPincodeScreen'
import { WelcomeScreen } from 'src/features/onboarding/welcome/WelcomeScreen'
import { EnterPincodeScreen } from 'src/features/pincode/EnterPincodeScreen'
import { SendConfirmationScreen } from 'src/features/send/SendConfirmationScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'

export class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeFrame />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="tx" element={<TransactionReview />} />
            <Route path="send" element={<SendFormScreen />} />
            <Route path="send-review" element={<SendConfirmationScreen />} />
            <Route path="exchange-review" element={<ExchangeConfirmationScreen />} />
            <Route path="exchange" element={<ExchangeFormScreen />} />
          </Route>
          <Route path="welcome" element={<WelcomeScreen />} />
          <Route path="new" element={<NewWalletScreen />} />
          <Route path="import" element={<ImportWalletScreen />} />
          <Route path="set-pin" element={<SetPincodeScreen />} />
          <Route path="pin" element={<EnterPincodeScreen />} />

          {/* TODO: For Splashscreen Testing */}
          <Route path="splash" element={<SplashScreen />} />
        </Routes>
      </BrowserRouter>
    )
  }
}
