import { Navigate, Outlet } from 'react-router'
import { config } from 'src/config'
import { isWalletInStorage } from 'src/features/wallet/storage'

export function OnboardingNavigator() {
  // If wallet exists in storage don't allow user back into onboarding flow
  if (isWalletInStorage() || config.defaultAccount) {
    return <Navigate to="/" replace={true} />
  }

  // Otherwise, render screen as normal
  return <Outlet />
}
