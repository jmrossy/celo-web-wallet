import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { SetPasswordForm } from 'src/features/password/SetPasswordForm'
import { getPendingAccount } from 'src/features/wallet/manager'
import { Mnemonic } from 'src/features/wallet/mnemonic'
import { Font } from 'src/styles/fonts'

export function SetPasswordScreen() {
  const location = useLocation()
  // @ts-ignore
  const pageNumber = location?.state?.pageNumber ?? 3
  const navigate = useNavigate()

  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(null)
  useEffect(() => {
    // A pending account must have been created or imported before reaching here
    const pendingMnemonic = getPendingAccount()
    if (pendingMnemonic) {
      setMnemonic(pendingMnemonic)
    } else {
      navigate('/setup', { replace: true })
    }
  }, [])

  return (
    <OnboardingScreenFrame current={pageNumber} total={pageNumber}>
      <h1 css={Font.h1Green}>Set Account Password</h1>
      <SetPasswordForm />
    </OnboardingScreenFrame>
  )
}
