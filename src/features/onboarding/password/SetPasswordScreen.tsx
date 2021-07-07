import { useLocation, useNavigate } from 'react-router-dom'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { SetPasswordForm } from 'src/features/password/SetPasswordForm'
import { Font } from 'src/styles/fonts'
import { Styles } from 'src/styles/types'

// Set password screen for the onboarding flow
// for the add flow see /features/wallet/accounts/AddSetPasswordScreen.tsx
export function SetPasswordScreen() {
  const location = useLocation()
  // @ts-ignore
  const pageNumber = location?.state?.pageNumber ?? 3

  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <OnboardingScreenFrame current={pageNumber} total={pageNumber}>
      <h1 css={Font.h1Green}>Set Account Password</h1>
      <h2 css={descriptionStyle}>This password encrypts your accounts on this device.</h2>
      <SetPasswordForm onSuccess={onSuccess} />
    </OnboardingScreenFrame>
  )
}
const descriptionStyle: Styles = {
  ...onboardingStyles.description,
  maxWidth: '22em',
  margin: '0 0.5em 0.5em 0.5em',
}
