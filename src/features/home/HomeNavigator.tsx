import { shallowEqual, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { SignerType } from 'src/blockchain/signer'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
import { LedgerUnlockScreen } from 'src/features/ledger/LedgerUnlockScreen'
import { EnterPasswordScreen } from 'src/features/password/EnterPasswordScreen'
import { useAccountLockStatus } from 'src/features/password/password'
import { isWalletInStorage } from 'src/features/wallet/storage_v1'

export function HomeNavigator() {
  const { address, type, isUnlocked } = useAccountLockStatus()

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
  if (isWalletInStorage()) {
    return <EnterPasswordScreen />
  }

  // If a wallet has been found in redux store and it's of type Ledger
  if (address && type === SignerType.Ledger) {
    return <LedgerUnlockScreen />
  }

  // Otherwise, account must not be set up yet
  return <Navigate to="/setup" replace={true} />
}
