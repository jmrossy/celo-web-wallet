import { shallowEqual, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from '../../app/rootReducer'
import { SignerType } from '../../blockchain/types'
import { ScreenFrame } from '../../components/layout/ScreenFrame'
import { LoginScreen } from '../password/LoginScreen'
import { useAccountLockStatus } from '../password/password'
import { hasAccounts } from '../wallet/manager'
import { hasAccount_v1 } from '../wallet/storage_v1'

export function HomeNavigator() {
  const { isUnlocked, address, type } = useAccountLockStatus()

  // Force navigation to fail screen if providers are unable to connect
  const isConnected = useSelector((s: RootState) => s.wallet.isConnected, shallowEqual)
  if (isConnected === false) throw new Error('Unable to connect to network.')

  // If password has been entered already
  if (isUnlocked) {
    return (
      <ScreenFrame>
        <Outlet />
      </ScreenFrame>
    )
  }

  // If wallet exists in storage but is not unlocked yet
  // TODO: Remove hasLedgerAccount condition after roughly 2021/09/01
  // Its only use is for migrating ledger accounts from before multi-account support
  const hasLedgerAccount = address && type === SignerType.Ledger
  if (hasAccounts() || hasAccount_v1() || hasLedgerAccount) {
    return <LoginScreen />
  }

  // Otherwise, account must not be set up yet
  return <Navigate to="/setup" replace={true} />
}
