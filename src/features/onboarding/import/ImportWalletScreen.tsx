import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Font } from 'src/styles/fonts'

export function ImportWalletScreen() {
  return (
    <OnboardingScreenFrame current={3} total={4}>
      <h1 css={Font.h1Green}>Import Your Account Key</h1>
      <ImportWalletForm />
    </OnboardingScreenFrame>
  )
}
