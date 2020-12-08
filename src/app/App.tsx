import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BadBrowserScreen } from 'src/app/BadBrowserScreen'
import { ErrorBoundary } from 'src/app/FailScreen'
import { Loading } from 'src/app/Loading'
import { NotFoundScreen } from 'src/app/NotFoundScreen'
import { useSplashScreen } from 'src/app/splash'
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
import { ChangePincodeScreen } from 'src/features/pincode/ChangePincodeScreen'
import { SendConfirmationScreen } from 'src/features/send/SendConfirmationScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'
import { DevTools } from 'src/features/settings/DevTools'
import { ViewWalletScreen } from 'src/features/wallet/ViewWalletScreen'
import { useBrowserFeatureChecks } from 'src/utils/browsers'

export const App = () => {
  const showSplash = useSplashScreen()
  const isBrowserSupported = useBrowserFeatureChecks()

  // Don't load the app until we're done with the splash screen
  if (showSplash) return null

  if (!isBrowserSupported) return <BadBrowserScreen />

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
            <Route path="change-pin" element={<ChangePincodeScreen />} />

            {/* TODO: For Splashscreen Testing */}
            <Route path="home" element={<HomeScreen />} />
            <Route path="loading" element={<Loading />} />
            <Route path="modals" element={<ModalTestScreen />} />
            <Route path="dev" element={<DevTools />} />

            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </ModalProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
