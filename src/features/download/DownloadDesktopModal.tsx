import { PropsWithChildren } from 'react'
import { TextButton } from '../../components/buttons/TextButton'
import AppleLogo from '../../components/icons/logos/apple.svg'
import LinuxLogo from '../../components/icons/logos/linux.svg'
import WindowsLogo from '../../components/icons/logos/windows.svg'
import { Box } from '../../components/layout/Box'
import { ModalLinkGrid } from '../../components/modal/ModalLinkGrid'
import { modalStyles } from '../../components/modal/modalStyles'
import { useModal } from '../../components/modal/useModal'
import { config } from '../../config'
import { Styles } from '../../styles/types'

interface ButtonProps {
  styles?: Styles
}

export function useDownloadDesktopModal(limitFeatureVersion = true) {
  const { showModalWithContent } = useModal()
  return () => {
    showModalWithContent({
      head: 'Celo Wallet for Desktop',
      content: <DownloadDesktopModal limitFeatureVersion={limitFeatureVersion} />,
    })
  }
}

export function DownloadDesktopButton({ children, styles }: PropsWithChildren<ButtonProps>) {
  const { showModalWithContent } = useModal()

  const onClick = () => {
    showModalWithContent({ head: 'Celo Wallet for Desktop', content: <DownloadDesktopModal /> })
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
      <h3 css={modalStyles.h3}>{text}</h3>
      <ModalLinkGrid links={links} />
    </Box>
  )
}
