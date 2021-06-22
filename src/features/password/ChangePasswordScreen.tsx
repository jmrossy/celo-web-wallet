import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { ChangePasswordForm } from 'src/features/password/ChangePasswordForm'
import { isAccountUnlocked } from 'src/features/password/password'
import { isWalletInStorage } from 'src/features/wallet/storage_v1'
import { Font } from 'src/styles/fonts'

export function ChangePasswordScreen() {
  const navigate = useNavigate()

  //Make sure we belong here
  useEffect(() => {
    if (!isAccountUnlocked() || !isWalletInStorage()) {
      navigate('/', { replace: true })
    }
  }, [])

  return (
    <OnboardingScreenFrame>
      <h1 css={{ ...Font.h1Green, marginBottom: '0.5em' }}>Change your Pincode or Password</h1>
      <ChangePasswordForm />
    </OnboardingScreenFrame>
  )
}
