import { PropsWithChildren } from 'react'
import Logo from 'src/components/icons/logo.svg'
import { Box } from 'src/components/layout/Box'
import { PageDots } from 'src/features/onboarding/PageDots'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface Props {
  // For page dots
  current?: number
  total?: number
}

export function OnboardingScreenFrame({ current, total, children }: PropsWithChildren<Props>) {
  return (
    <Box direction="column" align="center" justify="between" styles={style.container}>
      <div css={style.logoContainer}>
        <img width="140" height="42" src={Logo} alt="Celo Logo" css={style.logo} />
      </div>
      <Box align="center" justify="center" direction="column" styles={style.childrenContainer}>
        {children}
      </Box>
      <div css={style.dotsContainer}>
        {current && total && <PageDots current={current} total={total} />}
      </div>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    width: '100%',
  },
  logoContainer: {
    alignSelf: 'flex-start',
  },
  logo: {
    width: '8em',
    maxWidth: '25vw',
    padding: '1em 1.25em',
    [mq[768]]: {
      padding: '1.5em 1.5em',
    },
  },
  childrenContainer: {
    maxWidth: '46em',
  },
  dotsContainer: {
    margin: '1.5em',
    borderRadius: 8,
    padding: '0.6em',
    background: 'rgba(255,255,255,0.5)',
  },
}
