import { PropsWithChildren, ReactElement } from 'react'
import { Button } from 'src/components/buttons/Button'
import { CloseButton } from 'src/components/buttons/CloseButton'
import { CheckmarkInElipseIcon } from 'src/components/icons/Checkmark'
import { Box } from 'src/components/layout/Box'
import { LoadingIndicator } from 'src/components/LoadingIndicator'
import { Backdrop } from 'src/components/modal/Backdrop'
import { Color } from 'src/styles/Color'
import { Styles, Stylesheet } from 'src/styles/types'

export type ModalActionCallback = (action: ModalAction) => void

export interface ModalAction {
  key: string
  label: string
  color?: Color
}

export type ModalSeverity = 'default' | 'error'
export type ModalSize = 's' | 'm' | 'l'
export type ModalType = 'default' | 'loading'

export interface ModalProps {
  severity?: ModalSeverity //default to "default"
  head: string
  headIcon?: ReactElement
  headColor?: string
  subHead?: string
  body?: string
  actions?: ModalAction | ModalAction[]
  size?: ModalSize
  type?: ModalType
  onActionClick?: ModalActionCallback | null
  onClose?: (action?: ModalAction | null) => void | null
}

export const ModalOkAction: ModalAction = {
  key: 'ok',
  label: 'OK',
  color: Color.primaryGreen,
}

export function Modal(props: PropsWithChildren<ModalProps>) {
  const {
    head,
    headIcon,
    headColor,
    subHead,
    body,
    onClose,
    actions,
    onActionClick,
    type,
    children,
  } = props

  const allActions = actions ? (Array.isArray(actions) ? actions : [actions]) : []

  const backdropClick = (e?: React.MouseEvent<any>) => {
    if (e && e.target === e.currentTarget) {
      if (onClose) onClose()
    }
  }

  if (type === 'loading') {
    return <LoadingModal head={head} />
  }

  return (
    <>
      <Backdrop onClick={backdropClick} />
      <div css={style.modalContainer} onClick={backdropClick}>
        <div id="modal" css={[style.modal, propsToModalStyle(props)]}>
          <Box
            align="center"
            justify="between"
            styles={{ ...style.headContainer, backgroundColor: headColor ?? Color.fillLight }}
          >
            <div css={style.headIcon}>{headIcon}</div>
            <h1 css={[style.head, headColor && { color: '#FFF' }]}>{head}</h1>
            <div css={style.closeButton}>
              {onClose && (
                <CloseButton
                  onClick={onClose}
                  iconStyles={style.closeIcon}
                  color={headColor ? 'light' : 'dark'}
                />
              )}
            </div>
          </Box>
          <Box direction="column" justify="between" styles={style.modalContent}>
            <Box direction="column" align="center">
              {subHead && <h2 css={[style.subHead, propsToSubHeadStyle(props)]}>{subHead}</h2>}
              {!children && body && (
                <div css={[style.bodyText, propsToBodyStyle(props)]}>{body}</div>
              )}
              {children}
            </Box>
            {onActionClick && allActions && allActions.length > 0 && (
              <Box direction="row" justify="center" margin="1.6em 0 0 0">
                {allActions.map((action) => {
                  return (
                    <Button
                      key={action.key}
                      onClick={() => onActionClick(action)}
                      color={action.color || Color.primaryGreen}
                      margin="0 0.75em"
                      size="s"
                    >
                      {action.label}
                    </Button>
                  )
                })}
              </Box>
            )}
          </Box>
        </div>
      </div>
    </>
  )
}

export function SuccessModalContent() {
  return (
    <div css={{ marginTop: '1em' }}>
      <CheckmarkInElipseIcon />
    </div>
  )
}

function LoadingModal({ head }: { head: string }) {
  return (
    <>
      <Backdrop />
      <div css={style.modalContainer}>
        <div id="modal" css={[style.modal, style.loadingModal]}>
          <h1 css={[style.head, style.loadingHead]}>{head}</h1>
          <div css={style.loadingContainer}>
            <LoadingIndicator />
          </div>
        </div>
      </div>
    </>
  )
}

const style: Stylesheet = {
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    position: 'relative',
    minWidth: '20em',
    maxWidth: 'min(90vw, 30em)',
    minHeight: '13em',
    maxHeight: 'min(75vh, 27em)',
    backgroundColor: Color.primaryWhite,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto',
    overflow: 'hidden',
    boxShadow: '0px 3px 4px 0px rgba(0, 0, 0, 0.15)',
  },
  loadingModal: {
    width: '22em',
    height: '19em',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    padding: '1.4em',
    overflowY: 'auto',
  },
  headContainer: {
    position: 'relative',
    width: '100%',
    padding: '0.75em 0',
  },
  head: {
    margin: 0,
    fontSize: '1.2em',
    fontWeight: 500,
    textAlign: 'center',
  },
  headIcon: {
    paddingLeft: '1.4em',
    width: '1.2em',
    overflow: 'visible',
  },
  closeButton: {
    paddingRight: '1em',
  },
  closeIcon: {
    height: '1.2em',
    width: '1.2em',
  },
  subHead: {
    margin: '0.1em 0 0 0',
    fontSize: '1.15em',
    fontWeight: 400,
    textAlign: 'center',
    maxWidth: '25em',
  },
  bodyText: {
    textAlign: 'center',
    lineHeight: '1.6em',
  },
  loadingHead: {
    position: 'absolute',
    top: '1em',
    opacity: 0.85,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
}

const propsToSubHeadStyle = (props: ModalProps): Styles => {
  return props.severity?.toLowerCase() === 'error' ? { color: Color.textError } : {}
}

const propsToBodyStyle = (props: ModalProps): Styles => {
  return props.subHead ? { margin: '1.4em 0 0 0' } : { margin: '0.2em 0 0 0' }
}

const propsToModalStyle = (props: ModalProps): Styles => {
  return props.size === 's' ? { maxWidth: '25vw' } : props.size === 'l' ? { maxWidth: '80vw' } : {}
}
