import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { EnterPincodeForm } from 'src/features/pincode/EnterPincodeForm'
import { Font } from 'src/styles/fonts'

export function EnterPincodeScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Unlock Your Account</h1>
      <EnterPincodeForm />
    </OnboardingScreenFrame>
  )
}
