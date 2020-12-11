import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { isSignerSet } from 'src/blockchain/signer'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { SetPincodeForm } from 'src/features/pincode/SetPincodeForm'
import { Font } from 'src/styles/fonts'

export function SetPincodeScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    // Wallet must have been created or imported before reaching here
    if (!isSignerSet()) {
      navigate('/setup', { replace: true })
    }
  }, [])

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Set Your Account Pin</h1>
      <SetPincodeForm />
    </OnboardingScreenFrame>
  )
}
