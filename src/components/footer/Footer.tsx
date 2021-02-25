import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { AboutWalletLink } from 'src/components/footer/AboutWallet'
import { ConnectionStatusLink } from 'src/components/footer/ConnectionStatus'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { DownloadDesktopButton } from 'src/features/download/DownloadDesktopModal'
import { useWalletAddress } from 'src/features/wallet/utils'
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
        <ValoraLink />
        <span>-</span>
        <ViewSourceLink />
      </Box>
      <Box direction="row" align="center">
        <CopiableAddress address={address} length="full" styles={style.address} />
        <ConnectionStatusLink />
      </Box>
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
  address: {
    padding: '0 1.3em',
    fontSize: '0.8em',
    fontWeight: 300,
    color: Color.primaryBlack,
    display: 'none',
    [mq[1200]]: {
      display: 'block',
    },
  },
}
