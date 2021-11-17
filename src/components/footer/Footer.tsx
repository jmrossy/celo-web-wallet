import { CopiableAddress } from '../buttons/CopiableAddress'
import { AboutWalletLink } from '../footer/AboutWallet'
import { ConnectionStatusLink } from '../footer/ConnectionStatus'
import { HelpButton } from '../footer/Help'
import { Box } from '../layout/Box'
import { config } from 'src/config'
import { DownloadDesktopButton } from '../../features/download/DownloadDesktopModal'
import { useWalletAddress } from '../../features/wallet/hooks'
import { Color } from '../../styles/Color'
import { mq, useIsMobile } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'

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
