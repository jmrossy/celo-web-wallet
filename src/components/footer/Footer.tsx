import { CSSObject } from '@emotion/core'
import { Box } from 'src/components/layout/Box'
import { config, getVersion } from 'src/config'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface FooterProps {
  isOnboarding?: boolean // Use onboarding screen style
}

export function Footer(props: FooterProps) {
  const version = getVersion()
  const showVersion = version && config.debug

  const anchorStyle = props.isOnboarding ? style.anchorOnboarding : textStyle
  const containerStyle = props.isOnboarding ? style.containerOnboarding : style.container

  return (
    <Box align="center" justify="between" styles={containerStyle}>
      {showVersion && <div></div>}
      <Box align="center" justify="center">
        <a css={anchorStyle} href="https://celo.org" target="_blank" rel="noopener noreferrer">
          Learn More About Celo
        </a>
        <a css={anchorStyle} href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
          Try the Celo Mobile Wallet
        </a>
        <a
          css={anchorStyle}
          href="https://github.com/celo-tools/celo-web-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source on Github
        </a>
      </Box>
      {showVersion && <div css={style.version}>{version}</div>}
    </Box>
  )
}

const textStyle: CSSObject = {
  padding: '0 0.5em',
  fontSize: '0.8em',
  color: Color.primaryBlack,
  textAlign: 'center',
  textDecoration: 'none',
}

const style: Stylesheet = {
  container: {
    padding: '1em',
    width: '100%',
    opacity: 0.8,
    borderTop: `1px solid ${Color.borderLight}`,
  },
  containerOnboarding: {
    padding: '1.5em',
    width: '100%',
    opacity: 0.9,
  },
  anchorOnboarding: {
    ...textStyle,
    padding: '0 1em',
    fontSize: '1em',
    textDecoration: 'underline',
    marginBottom: '0.5em',
  },
  version: {
    display: 'none',
    [mq[768]]: {
      ...textStyle,
      display: 'inline',
    },
  },
}
