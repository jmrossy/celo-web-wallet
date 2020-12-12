import { AboutWalletLink } from 'src/components/footer/AboutWallet'
import { ConnectionStatusLink } from 'src/components/footer/ConnectionStatus'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function Footer() {
  const isMobile = useIsMobile()

  return isMobile ? <FooterMobile /> : <FooterDesktop />
}

function FooterDesktop() {
  return (
    <Box align="center" justify="between" styles={style.container}>
      <Box align="center" justify="center">
        <AboutWalletLink styles={style.text} />
        <span>-</span>
        <ValoraLink />
        <span>-</span>
        <ViewSourceLink />
      </Box>
      <ConnectionStatusLink />
    </Box>
  )
}

function FooterMobile() {
  return (
    <Box align="center" justify="around" styles={style.container}>
      <AboutWalletLink styles={style.text} />
      <ValoraLink />
      <ConnectionStatusLink />
    </Box>
  )
}

function ValoraLink() {
  return (
    <a css={style.text} href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
      Valora Mobile App
    </a>
  )
}

function ViewSourceLink() {
  return (
    <a
      css={style.text}
      href="https://github.com/celo-tools/celo-web-wallet"
      target="_blank"
      rel="noopener noreferrer"
    >
      View Source
    </a>
  )
}

const style: Stylesheet = {
  container: {
    padding: '0.5em 0.8em',
    width: '100%',
    borderTop: `1px solid ${Color.borderLight}`,
  },
  text: {
    opacity: 0.8,
    padding: '0 1.2em',
    fontSize: '0.8em',
    fontWeight: 300,
    color: Color.primaryBlack,
    textAlign: 'center',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
}
