import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { AboutWalletLink } from 'src/components/footer/AboutWallet'
import { ConnectionStatusLink } from 'src/components/footer/ConnectionStatus'
import { HelpButton } from 'src/components/footer/Help'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { VALORA_URL } from 'src/consts'
import { DownloadDesktopButton } from 'src/features/download/DownloadDesktopModal'
import { useWalletAddress } from 'src/features/wallet/hooks'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function Footer() {
  const isMobile = useIsMobile()
  return isMobile ? <FooterMobile /> : <FooterDesktop />
}

function FooterDesktop() {
  const address = useWalletAddress()
  return (
    <footer>
      <Box align="center" justify="between" styles={style.container}>
        <Box align="center" justify="center">
          <AboutWalletLink styles={style.text} />
          <span>-</span>
          {!config.isElectron && (
            <>
              <DownloadDesktopButton styles={style.text} />
              <span>-</span>
            </>
          )}
          <ViewSourceLink />
          <span>-</span>
          <HelpButton styles={style.text} />
        </Box>
        <Box direction="row" align="center">
          <CopiableAddress address={address} length="full" styles={style.address} />
          <ConnectionStatusLink />
        </Box>
      </Box>
    </footer>
  )
}

function FooterMobile() {
  return (
    <footer>
      <Box align="center" justify="around" styles={style.container}>
        <AboutWalletLink styles={style.text} />
        <ValoraLink />
        <ConnectionStatusLink />
      </Box>
    </footer>
  )
}

function ValoraLink() {
  return (
    <a css={style.text} href={VALORA_URL} target="_blank" rel="noopener noreferrer">
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
    fontWeight: 400,
    color: Color.primaryBlack,
    textAlign: 'center',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  address: {
    padding: '0 1.3em',
    fontSize: '0.8em',
    fontWeight: 400,
    color: Color.primaryBlack,
    display: 'none',
    [mq[1200]]: {
      display: 'block',
    },
  },
}
