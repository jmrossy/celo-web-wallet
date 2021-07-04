import { shallowEqual, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { config } from 'src/config'
import { hasAccounts } from 'src/features/wallet/manager'
import { hasAccount_v1 } from 'src/features/wallet/storage_v1'

export function OnboardingNavigator() {
  // If wallet exists in storage don't allow user back into onboarding flow
  if (hasAccounts() || hasAccount_v1() || config.defaultAccount) {
    return <Navigate to="/" replace={true} />
  }

  // Force navigation to fail screen if providers are unable to connect
  const isConnected = useSelector((s: RootState) => s.wallet.isConnected, shallowEqual)
  if (isConnected === false) throw new Error('Unable to connect to network.')

  // Otherwise, render screen as normal
  return <Outlet />
}
