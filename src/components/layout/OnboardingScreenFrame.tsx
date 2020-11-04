import { PropsWithChildren } from 'react'
import Logo from 'src/components/icons/logo.svg'
import { Box } from 'src/components/layout/Box'
import { Stylesheet } from 'src/styles/types'

export function OnboardingScreenFrame(props: PropsWithChildren<unknown>) {
  return (
    <Box direction="column" align="center" styles={style.container}>
      <div css={style.logoContainer}>
        <img width={'150em'} src={Logo} alt="Celo Logo" css={style.logo} />
      </div>
      <div css={style.content}>{props.children}</div>
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
  },
  logoContainer: {
    position: 'fixed',
    alignSelf: 'flex-start',
  },
  logo: {
    maxWidth: '25vw',
    padding: '0.75em 0.5em',
  },
}
