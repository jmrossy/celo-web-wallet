import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { ChangePincodeForm } from 'src/features/pincode/ChangePincodeForm'
import { Font } from 'src/styles/fonts'

export function ChangePincodeScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Change your pincode</h1>
      <ChangePincodeForm />
    </OnboardingScreenFrame>
  )
}
