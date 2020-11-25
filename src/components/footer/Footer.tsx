import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

export function Footer() {
  return (
    <Box align="center" justify="between" styles={style.container}>
      <Box align="center" justify="center">
        <a css={textStyle} href="https://celo.org" target="_blank" rel="noopener noreferrer">
          About Celo
        </a>
        <span>-</span>
        <a css={textStyle} href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
          Celo Mobile Wallet
        </a>
        <span>-</span>
        <a
          css={textStyle}
          href="https://github.com/celo-tools/celo-web-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source
        </a>
      </Box>
      {/* TODO check connected status and add icon */}
      <div css={style.version}>Connected</div>
    </Box>
  )
}

const textStyle: Styles = {
  padding: '0 0.8em',
  fontSize: '0.8em',
  fontWeight: 300,
  color: Color.primaryBlack,
  textAlign: 'center',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}

const style: Stylesheet = {
  container: {
    padding: '0.5em 0.8em',
    width: '100%',
    opacity: 0.8,
    borderTop: `1px solid ${Color.borderLight}`,
  },
  version: {
    display: 'none',
    [mq[768]]: {
      ...textStyle,
      display: 'inline',
    },
  },
}
