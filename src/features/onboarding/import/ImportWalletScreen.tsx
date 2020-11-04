import { Box } from 'src/components/layout/Box'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ImportWalletScreen() {
  return (
    <OnboardingScreenFrame>
      <Box align="center" justify="center" direction="column" styles={style.container}>
        <h1 css={style.header}>Import Your Celo Account</h1>
        <p css={style.description}>Enter your back key to import you account.</p>
        <p css={[style.description, Font.bold]}>Only import on devices you trust.</p>
        <ImportWalletForm />
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
    marginBottom: '1em',
  },
  description: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
}
