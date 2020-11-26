import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Loading } from 'src/app/Loading'
import { PersistedRootState } from 'src/app/store'
import { ModalProvider } from 'src/components/modal/modalContext'
import { ModalTestScreen } from 'src/components/modal/ModalTestScreen'
import { ExchangeConfirmationScreen } from 'src/features/exchange/ExchangeConfirmationScreen'
import { ExchangeFormScreen } from 'src/features/exchange/ExchangeFormScreen'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetch'
import { TransactionReview } from 'src/features/feed/TransactionReview'
import { HomeFrame } from 'src/features/home/HomeFrame'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { ImportWalletScreen } from 'src/features/onboarding/import/ImportWalletScreen'
import { NewWalletScreen } from 'src/features/onboarding/new/NewWalletScreen'
import { SetPincodeScreen } from 'src/features/onboarding/pincode/SetPincodeScreen'
import { WelcomeScreen } from 'src/features/onboarding/welcome/WelcomeScreen'
import { EnterPincodeScreen } from 'src/features/pincode/EnterPincodeScreen'
import { SendConfirmationScreen } from 'src/features/send/SendConfirmationScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'

export const App = () => {
  const dispatch = useDispatch()
  const isHydrated = useSelector((state: PersistedRootState) => state._persist.rehydrated)
  const walletAddress = useSelector((state: PersistedRootState) => state.wallet.address)
  const [lastWallet, setLastWallet] = useState<string | null>(null)

  useEffect(() => {
    if (isHydrated && walletAddress) {
      if (lastWallet && lastWallet !== walletAddress) {
        dispatch(clearTransactions())
      }
      setLastWallet(walletAddress)
      dispatch(fetchBalancesActions.trigger())
      dispatch(fetchFeedActions.trigger())
    }
  }, [isHydrated, walletAddress])

  return (
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
          </Route>
          <Route path="welcome" element={<WelcomeScreen />} />
          <Route path="new" element={<NewWalletScreen />} />
          <Route path="import" element={<ImportWalletScreen />} />
          <Route path="set-pin" element={<SetPincodeScreen />} />
          <Route path="pin" element={<EnterPincodeScreen />} />

          {/* TODO: For Splashscreen Testing */}
          <Route path="home" element={<HomeScreen />} />
          <Route path="loading" element={<Loading />} />
          <Route path="modals" element={<ModalTestScreen />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}
