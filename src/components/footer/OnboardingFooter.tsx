import { TextLink } from 'src/components/buttons/TextLink'
import { AboutWalletLink } from 'src/components/footer/AboutWallet'
import { Box } from 'src/components/layout/Box'
import { DownloadDesktopButton } from 'src/features/download/DownloadDesktopModal'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function OnboardingFooter() {
  return (
    <Box align="center" justify="center" styles={style.container}>
      <Box align="center" justify="center">
        <AboutWalletLink styles={style.anchor} />
        <span>-</span>
        <DownloadDesktopButton styles={style.anchor} />
        <span>-</span>
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
