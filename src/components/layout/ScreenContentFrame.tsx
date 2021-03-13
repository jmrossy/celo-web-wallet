import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'
import { CloseButton } from 'src/components/buttons/CloseButton'
import { Box } from 'src/components/layout/Box'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface FrameProps {
  onClose?: () => void
  hideCloseButton?: boolean
}

export function ScreenContentFrame(props: PropsWithChildren<FrameProps>) {
  const navigate = useNavigate()

  const { onClose, hideCloseButton } = props

  const onClickClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/')
    }
  }

  return (
    <Box direction="column" styles={style.contentContainer}>
      {!hideCloseButton && (
        <CloseButton
          onClick={onClickClose}
          styles={style.closeButton}
          iconStyles={style.closeButtonIcon}
        />
      )}
      {props.children}
    </Box>
  )
}

const style: Stylesheet = {
  contentContainer: {
    padding: '1.2em',
    position: 'relative',
    minHeight: '100%',
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
  closeButtonIcon: {
    height: '1.4em',
    width: '1.4em',
  },
}
