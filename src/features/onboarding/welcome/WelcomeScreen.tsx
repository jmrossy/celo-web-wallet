import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import { OnboardingFooter } from 'src/components/footer/OnboardingFooter'
import Logo from 'src/components/icons/logo-full.svg'
import { Box } from 'src/components/layout/Box'
import { Font } from 'src/styles/fonts'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WelcomeScreen() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const onClickCreateNew = () => {
    navigate('/setup/new')
  }

  const onClickUseExisting = () => {
    navigate('/setup/existing')
  }

  return (
    <Box direction="column" justify="between" align="center" styles={style.frame}>
      <div css={style.topPadding}></div>
      <Box direction="column" justify="center" align="center">
        <img width="410rem" height="100rem" src={Logo} alt="Celo Logo" css={style.logo} />
        <h1 css={style.h1}>{`A ${isMobile ? '' : 'simple '}wallet for the Celo network`}</h1>
        <h2 css={style.h2}>Manage your funds in a browser or on your desktop</h2>
        <div css={style.buttonContainer}>
          <Button
            size="l"
            onClick={onClickCreateNew}
            margin="0.75em 1.5em"
            styles={{ fontSize: '1.1em' }}
          >
            Create New Account
          </Button>
          <Button
            size="l"
            onClick={onClickUseExisting}
            margin="0.75em 1.5em"
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
  topPadding: {
    height: '1em',
    [mq[768]]: {
      height: '3em',
    },
  },
  logo: {
    maxWidth: '75%',
  },
  h1: {
    ...Font.h1,
    ...Font.bold,
    fontSize: '1.3em',
    margin: '0 0 0.5em 0',
    textAlign: 'center',
    maxWidth: '95%',
    [mq[768]]: {
      fontSize: '1.5em',
      marginTop: '0.5em',
    },
  },
  h2: {
    ...Font.h2,
    fontSize: '1.1em',
    margin: 0,
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '92%',
    [mq[768]]: {
      fontSize: '1.3em',
    },
  },
  buttonContainer: {
    marginTop: '1.5em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [mq[768]]: {
      marginTop: '2.5em',
      flexDirection: 'row',
    },
  },
}
