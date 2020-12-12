import { AboutWalletLink } from 'src/components/footer/AboutWallet'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export function OnboardingFooter() {
  return (
    <Box align="center" justify="center" styles={style.container}>
      <Box align="center" justify="center">
        <AboutWalletLink styles={style.anchor} />
        <span>-</span>
        <a
          css={style.anchor}
          href="https://valoraapp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try Valora Mobile Wallet
        </a>
        <span>-</span>
        <a
          css={style.anchor}
          href="https://github.com/celo-tools/celo-web-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source on Github
        </a>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    padding: '2em',
    width: '100%',
    opacity: 0.9,
  },
  anchor: {
    padding: '0 1em',
    fontSize: '1em',
    fontWeight: 400,
    textAlign: 'center',
    color: Color.primaryBlack,
    opacity: 0.8,
    ':hover': {
      opacity: 1,
    },
  },
}
