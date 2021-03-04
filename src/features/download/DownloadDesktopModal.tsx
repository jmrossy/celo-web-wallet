import { PropsWithChildren } from 'react'
import { TextButton } from 'src/components/buttons/TextButton'
import AppleLogo from 'src/components/icons/logos/apple.svg'
import LinuxLogo from 'src/components/icons/logos/linux.svg'
import WindowsLogo from 'src/components/icons/logos/windows.svg'
import { Box } from 'src/components/layout/Box'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

interface ButtonProps {
  styles?: Styles
}

export function useDownloadDesktopModal(limitFeatureVersion = true) {
  const { showModalWithContent } = useModal()
  return () => {
    showModalWithContent(
      'Celo Wallet for Desktop',
      <DownloadDesktopModal limitFeatureVersion={limitFeatureVersion} />
    )
  }
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
    ? 'For security reasons, this feature is only available in the desktop version. Sorry for the inconvenience but your account safety is essential!'
    : "The desktop version is more secure and includes extra features. It's strongly recommended for large accounts."

  const links = [
    {
      url: config.desktopUrls.windows,
      imgSrc: WindowsLogo,
      text: 'Windows',
    },
    {
      url: config.desktopUrls.mac,
      imgSrc: AppleLogo,
      text: 'MacOS',
    },
    {
      url: config.desktopUrls.linux,
      imgSrc: LinuxLogo,
      text: 'Linux',
    },
  ]

  return (
    <Box direction="column" align="center" justify="center">
      <h3 css={style.h3}>{text}</h3>
      <ModalLinkGrid links={links} />
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
}
