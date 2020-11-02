import { CSSObject } from '@emotion/core'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface FooterProps {
  isOnboarding?: boolean // Use onboarding screen style
}

export function Footer(props: FooterProps) {
  const anchorStyle = props.isOnboarding ? style.anchorOnboarding : textStyle
  const containerStyle = props.isOnboarding ? style.containerOnboarding : style.container

  return (
    <Box align="center" justify="between" styles={containerStyle}>
      <Box align="center" justify="center">
        <a css={anchorStyle} href="https://celo.org" target="_blank" rel="noopener noreferrer">
          About Celo
        </a>
        <span>-</span>
        <a css={anchorStyle} href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
          Celo Mobile Wallet
        </a>
        <span>-</span>
        <a
          css={anchorStyle}
          href="https://github.com/celo-tools/celo-web-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source
        </a>
      </Box>
      {/* TODO check connected status and add icon */}
      {<div css={style.version}>Connected</div>}
    </Box>
  )
}

const textStyle: CSSObject = {
  padding: '0 0.8em',
  fontSize: '0.8em',
  fontWeight: 300,
  color: Color.primaryBlack,
  textAlign: 'center',
  textDecoration: 'none',
}

const style: Stylesheet = {
  container: {
    padding: '0.5em 0.8em',
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
