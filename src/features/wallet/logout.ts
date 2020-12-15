import { useDispatch } from 'react-redux'
import { clearContractCache } from 'src/blockchain/contracts'
import { useModal } from 'src/components/modal/useModal'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { resetSettingFlags } from 'src/features/settings/settingsSlice'
import { removeWallet } from 'src/features/wallet/storage'
import { clearWallet } from 'src/features/wallet/walletSlice'
import { Color } from 'src/styles/Color'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put } from 'typed-redux-saga'

export function useLogoutModal() {
  const dispatch = useDispatch()
  const { showModalAsync } = useModal()
  const warning =
    'Do not logout before copying your Account Key (mnemonic phrase) to a safe place. Your account will be completely removed from this device.'
  const onLogout = async () => {
    const answer = await showModalAsync(
      'WARNING',
      warning,
      [
        { key: 'cancel', label: 'Cancel', color: Color.primaryGrey },
        { key: 'logout', label: 'Log me out', color: Color.primaryRed },
      ],
      'Backup your Account Key first!'
    )
    if (answer && answer.key === 'logout') {
      dispatch(logoutActions.trigger())
    }
  }
  return onLogout
}

export function* logout() {
  yield* call(removeWallet)
  yield* put(clearWallet())
  yield* put(clearTransactions())
  yield* put(resetSettingFlags())
  clearContractCache()
}

export const {
  name: logoutSagaName,
  wrappedSaga: logoutSaga,
  reducer: logoutReducer,
  actions: logoutActions,
} = createMonitoredSaga(logout, 'logout')
