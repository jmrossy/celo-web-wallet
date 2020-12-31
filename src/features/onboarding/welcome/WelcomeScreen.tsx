import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import { OnboardingFooter } from 'src/components/footer/OnboardingFooter'
import Logo from 'src/components/icons/logoWithWallet.svg'
import { Box } from 'src/components/layout/Box'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WelcomeScreen() {
  const navigate = useNavigate()

  const onClickCreateNew = () => {
    navigate('/setup/new')
  }

  const onClickUseExisting = () => {
    navigate('/setup/existing')
  }

  return (
    <Box direction="column" justify="between" align="center" styles={style.frame}>
      <Box direction="column" justify="center" align="center" styles={style.container}>
        <img width="500rem" height="107.5rem" src={Logo} alt="Celo Logo" css={style.logo} />
        <div css={style.buttonContainer}>
          <Button
            size="l"
            onClick={onClickCreateNew}
            margin={'1em 1.5em'}
            styles={{ fontSize: '1.1em' }}
          >
            Create New Account
          </Button>
          <Button
            size="l"
            onClick={onClickUseExisting}
            margin={'1em 1.5em'}
            styles={{ fontSize: '1.1em' }}
          >
            Use Existing Account
          </Button>
        </div>
      </Box>
      <OnboardingFooter />
    </Box>
  )
}

const style: Stylesheet = {
  frame: {
    minHeight: '100vh',
  },
  container: {
    marginTop: '30vh',
    [mq[768]]: {
      marginTop: '33vh',
    },
  },
  logo: {
    maxWidth: '75%',
  },
  buttonContainer: {
    marginTop: '3em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [mq[768]]: {
      flexDirection: 'row',
    },
  },
}
