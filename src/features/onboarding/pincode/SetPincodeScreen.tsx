import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSignerSet } from 'src/blockchain/signer'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { SetPincodeForm } from 'src/features/pincode/SetPincodeForm'
import { Font } from 'src/styles/fonts'

export function SetPincodeScreen() {
  const location = useLocation()
  // @ts-ignore
  const pageNumber = location?.state?.pageNumber ?? 3
  const navigate = useNavigate()

  useEffect(() => {
    // Wallet must have been created or imported before reaching here
    if (!isSignerSet()) {
      navigate('/setup', { replace: true })
    }
  }, [])

  return (
    <OnboardingScreenFrame current={pageNumber} total={pageNumber}>
      <h1 css={Font.h1Green}>Set Account Password</h1>
      <SetPincodeForm />
    </OnboardingScreenFrame>
  )
}
