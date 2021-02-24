import { useDispatch } from 'react-redux'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { DeviceAnimation } from 'src/features/ledger/animation/DeviceAnimation'
import {
  importLedgerWalletActions,
  importLedgerWalletSagaName,
} from 'src/features/ledger/importWallet'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

export function LedgerUnlockScreen() {
  const address = useWalletAddress()

  const dispatch = useDispatch()

  const onClickConnect = () => {
    dispatch(importLedgerWalletActions.trigger({ useExisting: true }))
  }

  const onLogout = useLogoutModal()

  const status = useSagaStatus(
    importLedgerWalletSagaName,
    'Error Unlocking Wallet',
    'Something went wrong, sorry! Please ensure your Ledger is connected, unlocked, and running the latest Celo app.'
  )

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Ledger Wallet</h1>
      <p css={style.description}>
        To unlock your account, connect your Ledger and confirm your address.
      </p>
      <Address address={address} />
      <div css={style.animationContainer}>
        <DeviceAnimation xOffset={48} />
      </div>
      <Button
        onClick={onClickConnect}
        margin="2em 0 0 0"
        disabled={status === SagaStatus.Started}
        size="l"
      >
        Connect
      </Button>
      <Button
        type="button"
        margin="1em 0 0 0"
        size="s"
        width="12.5em"
        color={Color.altGrey}
        disabled={status === SagaStatus.Started}
        onClick={onLogout}
      >
        Logout
      </Button>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  description: {
    ...onboardingStyles.description,
    marginBottom: '1.5em',
  },
  animationContainer: {
    margin: '2.5em 1em 1em 1em',
  },
}
