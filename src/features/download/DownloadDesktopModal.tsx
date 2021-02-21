import { PropsWithChildren } from 'react'
import { TextButton } from 'src/components/buttons/TextButton'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  styles?: Styles
}

export function DownloadDesktopButton({ children, styles }: PropsWithChildren<ButtonProps>) {
  const { showModalWithContent } = useModal()

  const onClick = () => {
    showModalWithContent('Download for Desktop', <DownloadDesktopModal />)
  }
  return (
    <TextButton onClick={onClick} styles={styles}>
      {children || 'Download for Desktop'}
    </TextButton>
  )
}

export function DownloadDesktopModal() {
  return (
    <Box direction="column" align="center" justify="center">
      <div>
        {
          "The desktop version is more secure and includes extra features! It's strongly recommended for large accounts."
        }
      </div>
    </Box>
  )
}
