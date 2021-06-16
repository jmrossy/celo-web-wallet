import { LedgerImportForm } from 'src/features/onboarding/import/LedgerImportForm'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Font } from 'src/styles/fonts'

export function LedgerImportScreen() {
  return (
    <OnboardingScreenFrame current={3} total={3}>
      <h1 css={Font.h1Green}>Import Your Ledger Account</h1>
      <LedgerImportForm />
    </OnboardingScreenFrame>
  )
}
