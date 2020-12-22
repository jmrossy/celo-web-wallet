import { Address } from 'src/components/Address'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { EnterPincodeForm } from 'src/features/pincode/EnterPincodeForm'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function EnterPincodeScreen() {
  const address = useWalletAddress()

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Account</h1>
      <div css={style.description}>Enter your pincode to unlock your account.</div>
      <Address address={address} />
      <EnterPincodeForm />
    </OnboardingScreenFrame>
  )
}
const style: Stylesheet = {
  description: {
    ...Font.body,
    marginBottom: '1.5em',
  },
}
