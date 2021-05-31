import { Link, Navigate } from 'react-router-dom'
import { Fade } from 'src/components/animation/Fade'
import NotFoundIcon from 'src/components/icons/not_found.svg'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function NotFoundScreen() {
  if (config.isElectron) {
    // On Electron, just route 404's back home
    // Necessary because initial route is not <filepath>/index.html
    return <Navigate to="/" replace={true} />
  }

  return (
    <OnboardingScreenFrame>
      <Fade show={true}>
        <Box direction="column" align="center">
          <h1 css={style.h1}>This page could not be found, sorry!</h1>
          <img width="200em" src={NotFoundIcon} alt="Not Found" css={style.img} />
          <h3 css={style.h3}>
            Please check the URL or go{' '}
            <Link to="/" css={{ color: Color.primaryBlack }}>
              back to home
            </Link>
            .
          </h3>
        </Box>
      </Fade>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h1,
    textAlign: 'center',
  },
  h3: {
    ...Font.h3,
    textAlign: 'center',
  },
  img: {
    margin: '2.5em',
  },
}
