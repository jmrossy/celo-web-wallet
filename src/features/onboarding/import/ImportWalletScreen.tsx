import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { Font } from 'src/styles/fonts'

export function ImportWalletScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Import Your Account Key</h1>
      <ImportWalletForm />
    </OnboardingScreenFrame>
  )
}
