import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { WalletDetails } from 'src/features/wallet/WalletDetails'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function NewWalletScreen() {
  const navigate = useNavigate()

  const onClickContinue = () => {
    navigate('/pin')
  }

  return (
    <OnboardingScreenFrame>
      <Box align="center" justify="center" direction="column" styles={style.container}>
        <h1 css={style.header}>Your New Celo Account</h1>
        <WalletDetails />
        <Button size={'m'} onClick={onClickContinue} margin={'3em 0 0 0'}>
          Continue
        </Button>
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
