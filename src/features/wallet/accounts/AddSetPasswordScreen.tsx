import { useNavigate } from 'react-router-dom'
import { SetPasswordForm } from 'src/features/password/SetPasswordForm'
import { Font } from 'src/styles/fonts'

// Set password screen for the add flow
// for the onboarding flow see /features/onboarding/password/SetPasswordScreen.tsx
export function AddSetPasswordScreen() {
  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/')
  }

  return (
    <>
      <h2 css={Font.h2Center}>Set Account Password</h2>
      <h4 css={Font.h4Center}>Local accounts require a password to keep them safe.</h4>
      <h4 css={Font.h4Center}>This password encrypts all your accounts on this device.</h4>
      <div css={{ margin: '1.5em' }}>
        <SetPasswordForm onSuccess={onSuccess} />
      </div>
    </>
  )
}
