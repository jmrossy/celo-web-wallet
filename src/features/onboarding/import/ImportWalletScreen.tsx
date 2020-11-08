import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ImportWalletScreen() {
  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1}>Import Your Celo Account</h1>
      <p css={style.description}>Enter your backup key to import your account.</p>
      <p css={[style.description, Font.extraBold]}>Only import on devices you trust.</p>
      <ImportWalletForm />
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
}
