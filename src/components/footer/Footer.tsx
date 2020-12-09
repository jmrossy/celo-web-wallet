import { ConnectionStatusLink } from 'src/components/footer/ConnectionStatus'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

export function Footer() {
  const isMobile = useIsMobile()

  return isMobile ? <FooterMobile /> : <FooterDesktop />
}

function FooterDesktop() {
  return (
    <Box align="center" justify="between" styles={style.container}>
      <Box align="center" justify="center">
        <AboutCeloLink />
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
      <AboutCeloLink />
      <ValoraLink />
      <ConnectionStatusLink />
    </Box>
  )
}

function AboutCeloLink() {
  return (
    <a css={textStyle} href="https://celo.org" target="_blank" rel="noopener noreferrer">
      About Celo
    </a>
  )
}

function ValoraLink() {
  return (
    <a css={textStyle} href="https://valoraapp.com" target="_blank" rel="noopener noreferrer">
      Valora Mobile App
    </a>
  )
}

function ViewSourceLink() {
  return (
    <a
      css={textStyle}
      href="https://github.com/celo-tools/celo-web-wallet"
      target="_blank"
      rel="noopener noreferrer"
    >
      View Source
    </a>
  )
}

const textStyle: Styles = {
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
}

const style: Stylesheet = {
  container: {
    padding: '0.5em 0.8em',
    width: '100%',
    borderTop: `1px solid ${Color.borderLight}`,
  },
}
