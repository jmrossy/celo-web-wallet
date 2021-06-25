import { shallowEqual, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
import { LoginScreen } from 'src/features/password/LoginScreen'
import { useAccountLockStatus } from 'src/features/password/password'
import { hasAccounts } from 'src/features/wallet/manager'

export function HomeNavigator() {
  const { isUnlocked } = useAccountLockStatus()

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
  if (hasAccounts()) {
    return <LoginScreen />
  }

  // Otherwise, account must not be set up yet
  return <Navigate to="/setup" replace={true} />
}
