import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { config } from 'src/config'
import { EnterPincodeScreen } from 'src/features/pincode/EnterPincodeScreen'
import { isAccountUnlocked } from 'src/features/pincode/pincode'
import { isWalletInStorage } from 'src/features/wallet/storage'

export function HomeFrame() {
  const { address, isUnlocked } = useSelector((s: RootState) => s.wallet)

  // TODO necessary until auto-timeout unlock works properly
  useSelector((s: RootState) => s.saga.pincode.status)

  // If pin has been entered already
  // NOTE: isAccountUnlocked is for security reasons (so they can't just change a persisted value in the local storage)
  // and isUnlocked is for flow reasons - so the pincode monitored saga gets reset after authenticating
  const unlocked = (isUnlocked && isAccountUnlocked()) || !!config.defaultAccount
  if (address && unlocked) {
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
