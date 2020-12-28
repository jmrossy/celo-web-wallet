import { PropsWithChildren } from 'react'
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

export type ModalSeverity = 'info' | 'success' | 'error' | 'default'
export type ModalSize = 's' | 'm' | 'l' | undefined

export interface ModalProps {
  severity?: ModalSeverity //default to "default"
  head: string
  subHead?: string
  body?: string
  actions?: ModalAction | ModalAction[]
  size?: ModalSize
  isLoading?: boolean
  isSuccess?: boolean
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
    subHead,
    body,
    onClose,
    actions,
    onActionClick,
    isLoading,
    isSuccess,
    children,
  } = props

  const allActions = actions ? (Array.isArray(actions) ? actions : [actions]) : []

  const backdropClick = (e?: React.MouseEvent<any>) => {
    if (e && e.target === e.currentTarget) {
      if (onClose) onClose()
    }
  }

  return (
    <>
      <Backdrop onClick={backdropClick} />
      <div css={[style.background, style.modalContainer]} onClick={backdropClick}>
        <div id="modal" css={[style.modal, propsToModalStyle(props)]}>
          <Box direction="column" justify="between" styles={style.modalContent}>
            <Box direction="column" align="center">
              <h1 css={style.head}>{head}</h1>
              {subHead && <h2 css={[style.subHead, propsToSubHeadStyle(props)]}>{subHead}</h2>}
              {!isLoading && !children && body && <div css={style.bodyText}>{body}</div>}
              {!isLoading && children}
              {isLoading && (
                <div css={style.loadingContainer}>
                  <LoadingIndicator />
                </div>
              )}
              {isSuccess && (
                <div css={style.successIcon}>
                  <CheckmarkInElipseIcon />
                </div>
              )}
              {onClose && <CloseButton onClick={onClose} styles={style.closeIcon} />}
            </Box>
            {onActionClick && allActions && allActions.length > 0 && (
              <Box direction="row" justify="center" margin="1.6em 0 0 0">
                {allActions.map((action) => {
                  return (
                    <Button
                      key={action.key}
                      onClick={() => onActionClick(action)}
                      color={action.color || Color.primaryGreen}
                      margin="0 1rem"
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

const style: Stylesheet = {
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    minWidth: '20em',
    maxWidth: 'min(70vw, 30em)',
    minHeight: '13em',
    maxHeight: 'min(60vh, 23em)',
    border: `1px solid ${Color.borderInactive}`,
    backgroundColor: 'white',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '1.6em',
    overflow: 'hidden',
    boxShadow: '0px 3px 4px 0px rgba(0, 0, 0, 0.15)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  head: {
    margin: 0,
    fontSize: '1.4em',
    fontWeight: 400,
    textAlign: 'center',
  },
  subHead: {
    margin: '1em 0 0 0',
    fontSize: '1.15em',
    fontWeight: 400,
    textAlign: 'center',
    maxWidth: '25em',
  },
  bodyText: {
    margin: '2em 0 0 0',
    textAlign: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: -12,
    right: -10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  successIcon: {
    marginTop: '1.5em',
  },
}

const propsToSubHeadStyle = (props: ModalProps): Styles => {
  return props.severity?.toLowerCase() === 'error' ? { color: Color.textError } : {}
}

const propsToModalStyle = (props: ModalProps): Styles => {
  if (props.isLoading) {
    // Hardcoded size for loading modal to fit animation well
    return {
      height: '19em',
      width: '22em',
      padding: 0,
      h1: {
        marginTop: '1em',
      },
    }
  }

  if (props.isSuccess) {
    // Hardcoded size to match loading modal
    return {
      height: '17.4em',
      width: '20.4em',
    }
  }

  return props.size === 's' ? { maxWidth: '25vw' } : props.size === 'l' ? { maxWidth: '80vw' } : {}
}
