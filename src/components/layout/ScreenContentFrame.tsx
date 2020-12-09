import { PropsWithChildren } from 'react'
import { CloseButton } from 'src/components/CloseButton'
import { Box } from 'src/components/layout/Box'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface FrameProps {
  onClose?: () => void
}

export function ScreenContentFrame(props: PropsWithChildren<FrameProps>) {
  const { onClose } = props

  return (
    <Box direction="column" styles={style.contentContainer}>
      {onClose && <CloseButton onClick={onClose} styles={style.closeButton} />}
      {props.children}
    </Box>
  )
}

const style: Stylesheet = {
  contentContainer: {
    padding: '1.2em 1.4em',
    height: '100%',
    position: 'relative',
    [mq[768]]: {
      padding: '1.5em 2em 1.5em 2em',
    },
    [mq[1200]]: {
      padding: '2.5em 3em 2.5em 3em',
    },
  },
  closeButton: {
    position: 'absolute',
    right: '1.4em',
    top: '1.2em',
    [mq[768]]: {
      right: '1.5em',
      top: '1.5em',
    },
    [mq[1200]]: {
      right: '2em',
      top: '2em',
    },
  },
}
