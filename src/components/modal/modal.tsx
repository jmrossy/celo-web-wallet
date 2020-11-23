import { css } from '@emotion/react'
import { PropsWithChildren } from 'react'
import { Button } from 'src/components/Button'
import CloseIcon from 'src/components/icons/close.svg'
import { Box } from 'src/components/layout/Box'
import { LoadingIndicator } from 'src/components/LoadingIndicator'
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
  onActionClick?: ModalActionCallback | null
  onClose?: (action?: ModalAction | null) => void | null
}

export const ModalOkAction: ModalAction = {
  key: 'ok',
  label: 'OK',
  color: Color.primaryGreen,
}

export function Modal(props: PropsWithChildren<ModalProps>) {
  const { head, subHead, body, onClose, actions, onActionClick, isLoading, children } = props

  const allActions = actions ? (Array.isArray(actions) ? actions : [actions]) : []

  const backdropClick = (e: React.MouseEvent<any>) => {
    if (e.target === e.currentTarget) {
      if (onClose) onClose()
    }
  }

  return (
    <>
      <div css={[style.background, style.modalBackdrop]} />
      <div css={[style.background, style.modalContainer]} onClick={backdropClick}>
        <div id="modal" css={[style.modal, dropShadow, propsToModalStyle(props)]}>
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
              {onClose && (
                <Button size="icon" icon={CloseIcon} styles={style.closeIcon} onClick={onClose} />
              )}
            </Box>
            {onActionClick && allActions && allActions.length > 0 && (
              <Box direction="row" justify="center" margin="2em 0 0 0">
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
  modalBackdrop: {
    backgroundColor: '#FFF8', //semi-transparent white
    zIndex: 99,
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
    maxWidth: '50%',
    minHeight: '13em',
    maxHeight: '50%',
    border: `1px solid ${Color.borderInactive}`,
    backgroundColor: 'white',
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '1em',
    overflow: 'hidden',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  head: {
    margin: 0,
    fontSize: '1.5em',
    fontWeight: 400,
  },
  subHead: {
    margin: '1em 0 0 0',
    fontSize: '1.15em',
    fontWeight: 400,
  },
  bodyText: {
    margin: '2em 0 0 0',
  },
  closeIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    maxHeight: '15em',
    maxWidth: '20em',
  },
}

const dropShadow = css`
  box-shadow: 3px 3px 6px 1px #ccc;
`

const propsToSubHeadStyle = (props: ModalProps): Styles => {
  const css: Styles = props.severity?.toLowerCase() === 'error' ? { color: Color.textError } : {}
  return css
}

const propsToModalStyle = (props: ModalProps): Styles => {
  const css: Styles =
    props.size === 's' ? { maxWidth: '25%' } : props.size === 'l' ? { maxWidth: '65%' } : {}
  return css
}
