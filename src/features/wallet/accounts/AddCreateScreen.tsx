import { useNavigate } from 'react-router-dom'
import { Box } from 'src/components/layout/Box'
import { NewAccountForm } from 'src/features/onboarding/new/NewAccountForm'
import { Font } from 'src/styles/fonts'

export function AddCreateScreen() {
  const navigate = useNavigate()
  const navigateToSetPin = () => {
    navigate('/accounts/set-pin')
  }
  return (
    <>
      <h2 css={Font.h2Center}>New Account Details</h2>
      <Box margin="1.5em 0 0 0" align="center" direction="column">
        <NewAccountForm navigateToSetPin={navigateToSetPin} />
      </Box>
    </>
  )
}
