import { TextLink } from '../buttons/TextLink'
import { AboutWalletLink } from '../footer/AboutWallet'
import { Box } from '../layout/Box'
import { config } from '../../config'
import { DownloadDesktopButton } from '../../features/download/DownloadDesktopModal'
import { Color } from '../../styles/Color'
import { mq } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'

export function OnboardingFooter() {
  return (
    <footer>
      <Box align="center" justify="center" styles={style.container}>
        <Box align="center" justify="center">
          <AboutWalletLink styles={style.anchor} />
          <span>-</span>
          {!config.isElectron && (
            <>
              <DownloadDesktopButton styles={style.anchor} />
              <span>-</span>
            </>
          )}
          <TextLink link="https://valoraapp.com" styles={style.anchor}>
            Valora Mobile App
          </TextLink>
          <span css={style.desktopOnly}>-</span>
          <TextLink
            link="https://github.com/celo-tools/celo-web-wallet"
            styles={[style.anchor, style.desktopOnly]}
          >
            View Source
          </TextLink>
        </Box>
      </Box>
    </footer>
  )
}

const style: Stylesheet = {
  container: {
    padding: '2em 0.5em',
    width: '100%',
    opacity: 0.9,
    [mq[768]]: {
      padding: '2em',
    },
  },
  anchor: {
    padding: '0 0.5em',
    fontSize: '1em',
    fontWeight: 400,
    textAlign: 'center',
    color: Color.primaryBlack,
    opacity: 0.8,
    ':hover': {
      opacity: 1,
    },
    [mq[768]]: {
      padding: '0 1em',
    },
  },
  desktopOnly: {
    display: 'none',
    [mq[768]]: {
      display: 'block',
    },
  },
}
