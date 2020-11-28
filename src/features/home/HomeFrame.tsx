import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { EnterPincodeScreen } from 'src/features/pincode/EnterPincodeScreen'
import { isAccountUnlocked, pincodeSagaName } from 'src/features/pincode/pincode'
import { isWalletInStorage } from 'src/features/wallet/storage'

export function HomeFrame() {
  const address = useSelector((s: RootState) => s.wallet.address)

  // To ensure re-renders on pincode success
  // TODO put some unlocked state in wallet slice and use that insteadc
  useSelector((s: RootState) => s.saga[pincodeSagaName].status)

  // If pin has been entered already
  if (address && isAccountUnlocked()) {
    return (
      <ScreenFrameWithFeed>
        <Outlet />
      </ScreenFrameWithFeed>
    )
  }

  // Else, if wallet exists in storage but is not unlocked yet
  if (isWalletInStorage()) {
    return <EnterPincodeScreen />
  }

  // Otherwise, account must not be set up yet
  return <Navigate to="/welcome" replace={true} />
}
