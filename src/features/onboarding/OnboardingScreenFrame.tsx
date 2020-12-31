import { PropsWithChildren } from 'react'
import Logo from 'src/components/icons/logo.svg'
import { Box } from 'src/components/layout/Box'
import { PageDots } from 'src/features/onboarding/PageDots'
import { Stylesheet } from 'src/styles/types'

interface Props {
  // For page dots
  current?: number
  total?: number
}

export function OnboardingScreenFrame({ current, total, children }: PropsWithChildren<Props>) {
  return (
    <Box direction="column" align="center" styles={style.container}>
      <div css={style.logoContainer}>
        <img width="150em" height="53.125em" src={Logo} alt="Celo Logo" css={style.logo} />
      </div>
      <div css={style.content}>
        <Box align="center" justify="center" direction="column" styles={style.childrenContainer}>
          {children}
        </Box>
      </div>
      {current && total && (
        <div css={style.dotsContainer}>
          <PageDots current={current} total={total} />
        </div>
      )}
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    height: '100vh',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    width: '100%',
  },
  logoContainer: {
    position: 'fixed',
    alignSelf: 'flex-start',
  },
  logo: {
    maxWidth: '25vw',
    padding: '0.75em 0.5em',
  },
  childrenContainer: {
    maxWidth: '46em',
    padding: '5em 2em 5em 2em',
    minHeight: '100%',
    margin: 'auto',
  },
  dotsContainer: {
    position: 'fixed',
    borderRadius: 8,
    bottom: '0.8em',
    padding: '0.6em',
    background: 'rgba(255,255,255,0.5)',
  },
}
