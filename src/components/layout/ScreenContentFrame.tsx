import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from 'src/components/buttons/BackButton'
import { CloseButton } from 'src/components/buttons/CloseButton'
import { Box } from 'src/components/layout/Box'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

interface FrameProps {
  onClose?: () => void
  hideCloseButton?: boolean
  showBackButton?: boolean
}

export function ScreenContentFrame(props: PropsWithChildren<FrameProps>) {
  const navigate = useNavigate()

  const { onClose, hideCloseButton, showBackButton } = props

  const onClickClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/')
    }
  }

  return (
    <Box direction="column" styles={style.contentContainer}>
      {showBackButton && <BackButton styles={backButtonStyle} iconStyles={style.navButtonIcon} />}
      {!hideCloseButton && (
        <CloseButton
          onClick={onClickClose}
          styles={closeButtonStyle}
          iconStyles={style.navButtonIcon}
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
  navButton: {
    position: 'absolute',
    top: '1.2em',
    [mq[768]]: {
      top: '1.6em',
    },
    [mq[1200]]: {
      top: '2.6em',
    },
  },
  navButtonIcon: {
    height: '1.4em',
    width: '1.4em',
  },
}

const closeButtonStyle: Styles = {
  ...style.navButton,
  right: '1.4em',
  [mq[768]]: {
    ...style.navButton[mq[768]],
    right: '2em',
  },
  [mq[1200]]: {
    ...style.navButton[mq[1200]],
    right: '3em',
  },
}

const backButtonStyle: Styles = {
  ...style.navButton,
  left: '1.4em',
  [mq[768]]: {
    ...style.navButton[mq[768]],
    left: '2em',
  },
  [mq[1200]]: {
    ...style.navButton[mq[1200]],
    left: '3em',
  },
}
