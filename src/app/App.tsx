import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from 'src/app/FailScreen'
import { Loading } from 'src/app/Loading'
import { ModalProvider } from 'src/components/modal/modalContext'
import { ModalTestScreen } from 'src/components/modal/ModalTestScreen'
import { ExchangeConfirmationScreen } from 'src/features/exchange/ExchangeConfirmationScreen'
import { ExchangeFormScreen } from 'src/features/exchange/ExchangeFormScreen'
import { TransactionReview } from 'src/features/feed/TransactionReview'
import { HomeFrame } from 'src/features/home/HomeFrame'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { ImportWalletScreen } from 'src/features/onboarding/import/ImportWalletScreen'
import { NewWalletScreen } from 'src/features/onboarding/new/NewWalletScreen'
import { SetPincodeScreen } from 'src/features/onboarding/pincode/SetPincodeScreen'
import { WelcomeScreen } from 'src/features/onboarding/welcome/WelcomeScreen'
import { SendConfirmationScreen } from 'src/features/send/SendConfirmationScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'
import { ViewWalletScreen } from 'src/features/wallet/ViewWalletScreen'

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ModalProvider>
          <Routes>
            <Route path="/" element={<HomeFrame />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="tx" element={<TransactionReview />} />
              <Route path="send" element={<SendFormScreen />} />
              <Route path="send-review" element={<SendConfirmationScreen />} />
              <Route path="exchange-review" element={<ExchangeConfirmationScreen />} />
              <Route path="exchange" element={<ExchangeFormScreen />} />
              <Route path="wallet" element={<ViewWalletScreen />} />
            </Route>

            {/* Onboarding */}
            <Route path="welcome" element={<WelcomeScreen />} />
            <Route path="new" element={<NewWalletScreen />} />
            <Route path="import" element={<ImportWalletScreen />} />
            <Route path="set-pin" element={<SetPincodeScreen />} />

            {/* TODO: For Splashscreen Testing */}
            <Route path="home" element={<HomeScreen />} />
            <Route path="loading" element={<Loading />} />
            <Route path="modals" element={<ModalTestScreen />} />
          </Routes>
        </ModalProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
