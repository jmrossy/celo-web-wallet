import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export function Footer() {
  return (
    <Box align="center" justify="center" styles={style.container}>
      <a css={style.anchor} href="https://celo.org">
        Learn More About Celo
      </a>
      <a css={style.anchor} href="https://valoraapp.com">
        Try the Celo Mobile Wallet
      </a>
      <a css={style.anchor} href="https://github.com/celo-tools/celo-web-wallet">
        View Source on Github
      </a>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    padding: '2em',
    opacity: 0.8,
  },
  anchor: {
    padding: '0 1em',
    color: Color.primaryBlack,
    textAlign: 'center',
  },
}
