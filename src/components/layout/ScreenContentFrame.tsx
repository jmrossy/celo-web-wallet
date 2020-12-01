import { PropsWithChildren } from 'react'
import { Button } from 'src/components/Button'
import CloseIcon from 'src/components/icons/close.svg'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface FrameProps {
  onClose?: () => void
}

export function ScreenContentFrame(props: PropsWithChildren<FrameProps>) {
  const { onClose } = props

  return (
    <Box direction="column" styles={style.contentContainer}>
      {onClose && (
        <Button
          size="icon"
          type="button"
          color={Color.primaryWhite}
          onClick={onClose}
          styles={style.closeButton}
        >
          <img src={CloseIcon} alt="Close" />
        </Button>
      )}
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
      padding: '2em 4em 2em 4em',
    },
  },
  closeButton: {
    position: 'absolute',
    right: '1.4em',
    top: '1.2em',
    [mq[768]]: {
      right: '2em',
      top: '2em',
    },
  },
}
