import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { ChangePincodeScreen } from 'src/features/pincode/ChangePincodeScreen'
import { EnterPincodeScreen } from 'src/features/pincode/EnterPincodeScreen'
import { isAccountUnlocked } from 'src/features/pincode/pincode'
import { isWalletInStorage } from 'src/features/wallet/storage'

export function HomeFrame() {
  const { address, isChangingPin } = useSelector((s: RootState) => s.wallet)

  // If pin has been entered already
  if (address && isAccountUnlocked()) {
    if (isChangingPin) {
      return <ChangePincodeScreen />
    }

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
