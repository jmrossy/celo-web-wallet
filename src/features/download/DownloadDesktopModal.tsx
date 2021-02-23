import { PropsWithChildren } from 'react'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import AppleLogo from 'src/components/icons/logos/apple.svg'
import WindowsLogo from 'src/components/icons/logos/windows.svg'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

interface ButtonProps {
  styles?: Styles
}

export function DownloadDesktopButton({ children, styles }: PropsWithChildren<ButtonProps>) {
  const { showModalWithContent } = useModal()

  const onClick = () => {
    showModalWithContent('Celo Wallet for Desktop', <DownloadDesktopModal />)
  }
  return (
    <TextButton onClick={onClick} styles={styles}>
      {children || 'Download for Desktop'}
    </TextButton>
  )
}

export function DownloadDesktopModal({ limitFeatureVersion }: { limitFeatureVersion?: boolean }) {
  const text = limitFeatureVersion
    ? 'For security reasons, this feature is only available in the desktop version. Sorry for the inconvenience but your account safety is important!'
    : "The desktop version is more secure and includes extra features. It's strongly recommended for large accounts."

  return (
    <Box direction="column" align="center" justify="center">
      <h3 css={style.h3}>{text}</h3>
      <Box direction="row" align="center">
        <button css={style.linkContent}>
          <img src={WindowsLogo} css={{ ...style.icon, paddingTop: '0.55em' }} alt="Windows Logo" />
          <div>Windows</div>
        </button>
        <button css={style.linkContent}>
          <img src={AppleLogo} css={style.icon} alt="Apple Logo" />
          <div>MacOS</div>
        </button>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  h3: {
    ...Font.body,
    textAlign: 'center',
    maxWidth: '24em',
    lineHeight: '1.6em',
  },
  linkContent: {
    ...transparentButtonStyles,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    width: '5.6em',
    height: '5.8em',
    margin: '0 1.5em',
    border: `1px solid ${Color.primaryWhite}`,
    ':hover': {
      borderColor: Color.altGrey,
    },
    [mq[768]]: {
      width: '7em',
      height: '7.2em',
    },
  },
  icon: {
    width: '2.5em',
    marginBottom: '1em',
    [mq[768]]: {
      width: '3em',
    },
  },
}
