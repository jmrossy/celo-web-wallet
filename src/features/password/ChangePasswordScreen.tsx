import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { ChangePasswordForm } from 'src/features/password/ChangePasswordForm'
import { hasPasswordCached } from 'src/features/password/password'
import { hasAccounts } from 'src/features/wallet/manager'
import { Font } from 'src/styles/fonts'

export function ChangePasswordScreen() {
  const navigate = useNavigate()

  //Make sure we belong here
  useEffect(() => {
    if (!hasPasswordCached() || !hasAccounts()) {
      navigate('/', { replace: true })
    }
  }, [])

  return (
    <OnboardingScreenFrame>
      <h1 css={{ ...Font.h1Green, marginBottom: '0.5em' }}>Change your Password</h1>
      <ChangePasswordForm />
    </OnboardingScreenFrame>
  )
}
