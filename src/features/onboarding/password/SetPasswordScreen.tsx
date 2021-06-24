import { useLocation } from 'react-router-dom'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { SetPasswordForm } from 'src/features/password/SetPasswordForm'
import { Font } from 'src/styles/fonts'

export function SetPasswordScreen() {
  const location = useLocation()
  // @ts-ignore
  const pageNumber = location?.state?.pageNumber ?? 3

  return (
    <OnboardingScreenFrame current={pageNumber} total={pageNumber}>
      <h1 css={Font.h1Green}>Set Account Password</h1>
      <SetPasswordForm />
    </OnboardingScreenFrame>
  )
}
