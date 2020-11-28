import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { SetPincodeForm } from 'src/features/pincode/SetPincodeForm'
import { Font } from 'src/styles/fonts'

export function SetPincodeScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Set Your Account Pin</h1>
      <SetPincodeForm />
    </OnboardingScreenFrame>
  )
}
