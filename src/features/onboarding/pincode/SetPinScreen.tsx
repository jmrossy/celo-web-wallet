import { Box } from 'src/components/layout/Box'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { PincodeForm } from 'src/features/pincode/PincodeForm'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function SetPinScreen() {
  return (
    <OnboardingScreenFrame>
      <Box align="center" justify="center" direction="column" styles={style.container}>
        <h1 css={style.header}>Set Your Account Pin</h1>
        <PincodeForm />
      </Box>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '46em',
    padding: '2em',
    height: '100%',
  },
  header: {
    ...Font.h1,
    marginBottom: '2em',
  },
}
