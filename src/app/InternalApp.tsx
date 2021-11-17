import { PropsWithChildren } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { BadBrowserScreen } from '../app/BadBrowserScreen'
import { useDeepLinkHandler } from './deepLink'
import { ErrorBoundary } from './FailScreen'
import { NotFoundScreen } from './NotFoundScreen'
import { useSplashScreen } from './splash'
import { UpdateBanner } from './UpdateBanner'
import { ModalProvider } from '../components/modal/modalContext'
import { config } from '../config'
import { ExchangeConfirmationScreen } from '../features/exchange/ExchangeConfirmationScreen'
import { ExchangeFormScreen } from '../features/exchange/ExchangeFormScreen'
import { TransactionReview } from '../features/feed/TransactionReview'
import { GovernanceConfirmationScreen } from '../features/governance/GovernanceConfirmationScreen'
import { GovernanceFormScreen } from '../features/governance/GovernanceFormScreen'
import { HomeNavigator } from '../features/home/HomeNavigator'
import { HomeScreen } from '../features/home/HomeScreen'
import { LockConfirmationScreen } from '../features/lock/LockConfirmationScreen'
import { LockFormScreen } from '../features/lock/LockFormScreen'
import { ImportAccountScreen } from '../features/onboarding/import/ImportAccountScreen'
import { ImportChoiceScreen } from '../features/onboarding/import/ImportChoiceScreen'
import { LedgerImportScreen } from '../features/onboarding/import/LedgerImportScreen'
import { NewAccountScreen } from '../features/onboarding/new/NewAccountScreen'
import { OnboardingNavigator } from '../features/onboarding/OnboardingNavigator'
import { SetPasswordScreen } from '../features/onboarding/password/SetPasswordScreen'
import { WelcomeScreen } from '../features/onboarding/welcome/WelcomeScreen'
import { ChangePasswordScreen } from '../features/password/ChangePasswordScreen'
import { SendConfirmationScreen } from '../features/send/SendConfirmationScreen'
import { SendFormScreen } from '../features/send/SendFormScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { ExploreValidatorsScreen } from '../features/validators/ExploreValidatorsScreen'
import { StakeConfirmationScreen } from '../features/validators/StakeConfirmationScreen'
import { StakeFormScreen } from '../features/validators/StakeFormScreen'
import { StakeRewardsScreen } from '../features/validators/StakeRewardsScreen'
import { AccountsAndContactsScreen } from '../features/wallet/accounts/AccountsAndContactsScreen'
import { AccountsNavigator } from '../features/wallet/accounts/AccountsNavigator'
import { AddAccountScreen } from '../features/wallet/accounts/AddAccountScreen'
import { AddCreateScreen } from '../features/wallet/accounts/AddCreateScreen'
import { AddDeriveScreen } from '../features/wallet/accounts/AddDeriveScreen'
import { AddImportScreen } from '../features/wallet/accounts/AddImportScreen'
import { AddLedgerScreen } from '../features/wallet/accounts/AddLedgerScreen'
import { AddSetPasswordScreen } from '../features/wallet/accounts/AddSetPasswordScreen'
import { ViewAccountScreen } from '../features/wallet/accounts/ViewAccountScreen'
import { BalanceDetailsScreen } from '../features/wallet/balances/BalanceDetailsScreen'
import { WalletConnectStatusBox } from '../features/walletConnect/WalletConnectStatusBox'
import { useBrowserFeatureChecks } from '../utils/browsers'

function Router(props: PropsWithChildren<any>) {
  // The BrowserRouter works everywhere except Windows OS so using hash for electron
  return config.isElectron ? (
    <HashRouter>{props.children}</HashRouter>
  ) : (
    <BrowserRouter>{props.children}</BrowserRouter>
  )
}

function DeepLinkHandler() {
  useDeepLinkHandler()
  return null
}

export const InternalApp = () => {
  const showSplash = useSplashScreen()
  // const isBrowserSupported = useBrowserFeatureChecks()

  // Don't load the app until we're done with the splash screen
  if (showSplash) return null

  // if (!isBrowserSupported) return <BadBrowserScreen />

  return (
    <ErrorBoundary>
      <Router>
        <ModalProvider>
          <DeepLinkHandler />
          <UpdateBanner />
          <Routes>
            <Route path="/" element={<HomeNavigator />}>
              <Route index element={<HomeScreen />} />
              <Route path="tx" element={<TransactionReview />} />
              <Route path="send" element={<SendFormScreen />} />
              <Route path="send-review" element={<SendConfirmationScreen />} />
              <Route path="exchange-review" element={<ExchangeConfirmationScreen />} />
              <Route path="exchange" element={<ExchangeFormScreen />} />
              <Route path="lock" element={<LockFormScreen />} />
              <Route path="lock-review" element={<LockConfirmationScreen />} />
              <Route path="validators" element={<ExploreValidatorsScreen />} />
              <Route path="stake" element={<StakeFormScreen />} />
              <Route path="stake-review" element={<StakeConfirmationScreen />} />
              <Route path="stake-rewards" element={<StakeRewardsScreen />} />
              <Route path="governance" element={<GovernanceFormScreen />} />
              <Route path="governance-review" element={<GovernanceConfirmationScreen />} />
              <Route path="balances" element={<BalanceDetailsScreen />} />
              <Route path="account" element={<ViewAccountScreen />} />
              <Route path="accounts" element={<AccountsNavigator />}>
                <Route index element={<AccountsAndContactsScreen />} />
                <Route path="add" element={<AddAccountScreen />} />
                <Route path="create" element={<AddCreateScreen />} />
                <Route path="derive" element={<AddDeriveScreen />} />
                <Route path="import" element={<AddImportScreen />} />
                <Route path="ledger" element={<AddLedgerScreen />} />
                <Route path="set-pin" element={<AddSetPasswordScreen />} />
              </Route>
              <Route path="settings" element={<SettingsScreen />} />
            </Route>

            <Route path="/setup" element={<OnboardingNavigator />}>
              <Route index element={<WelcomeScreen />} />
              <Route path="new" element={<NewAccountScreen />} />
              <Route path="existing" element={<ImportChoiceScreen />} />
              <Route path="import" element={<ImportAccountScreen />} />
              <Route path="ledger" element={<LedgerImportScreen />} />
              <Route path="set-pin" element={<SetPasswordScreen />} />
            </Route>

            <Route path="change-pin" element={<ChangePasswordScreen />} />

            {/* To faciliatate testing */}
            {/* <Route path="/dev/home" element={<HomeScreen />} />
            <Route path="/dev/modals" element={<ModalTestScreen />} />
            <Route path="/dev/tools" element={<DevTools />} /> */}

            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
          <WalletConnectStatusBox />
        </ModalProvider>
      </Router>
    </ErrorBoundary>
  )
}
