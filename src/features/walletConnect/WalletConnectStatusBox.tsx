import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { Fade } from 'src/components/animation/Fade'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import CloseIcon from 'src/components/icons/close.svg'
import { Box } from 'src/components/layout/Box'
import { useAccountLockStatus } from 'src/features/password/password'
import { WalletConnectStatus } from 'src/features/walletConnect/types'
import { getPeerName } from 'src/features/walletConnect/utils'
import { useWalletConnectModal } from 'src/features/walletConnect/WalletConnectModal'
import {
  disconnectWcClient,
  rejectWcRequest,
  rejectWcSession,
  resetWcClient,
} from 'src/features/walletConnect/walletConnectSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WalletConnectStatusBox() {
  const { address, isUnlocked } = useAccountLockStatus()
  const status = useAppSelector((s) => s.walletConnect.status)
  const session = useAppSelector((s) => s.walletConnect.session)

  const isActive = status !== WalletConnectStatus.Disconnected
  const isSessionPending = session && status === WalletConnectStatus.SessionPending
  const isReqPending = session && status === WalletConnectStatus.RequestPending

  const peerName = getPeerName(session, true)
  let header, description, color
  if (!address) {
    // TODO if user keeps status box open after creating
    // a new account, it shows error
    header = 'WalletConnect Ignored'
    description = 'Please setup account first'
    color = Color.textWarning
  } else if (status === WalletConnectStatus.Initializing) {
    header = 'WalletConnect Starting...'
    description = 'Looking for new sessions'
    color = Color.textWarning
  } else if (status === WalletConnectStatus.SessionPending) {
    header = 'New WalletConnect Session'
    description = isUnlocked ? `${peerName} would like to connect` : 'Unlock account to connect'
    color = Color.accentBlue
  } else if (status === WalletConnectStatus.SessionActive) {
    header = 'WalletConnect Active'
    description = `Waiting for requests from ${peerName}`
    color = Color.primaryGreen
  } else if (status === WalletConnectStatus.RequestPending) {
    header = 'Action Requested'
    description = isUnlocked ? `Review request from ${peerName}` : 'Unlock account to continue'
    color = Color.accentBlue
  } else if (status === WalletConnectStatus.RequestActive) {
    header = 'Action In Progress'
    description = 'Working on request...'
    color = Color.textWarning
  } else if (status === WalletConnectStatus.RequestComplete) {
    header = 'Action Complete'
    description = 'Request has finished'
    color = Color.primaryGreen
  } else if (status === WalletConnectStatus.RequestFailed || status === WalletConnectStatus.Error) {
    header = 'WalletConnect Error'
    description = isUnlocked ? 'Click here for details' : 'Unlock account for details'
    color = Color.textError
  } else {
    header = 'Disconnecting'
    description = 'WalletConnect is closing'
    color = Color.textWarning
  }

  const dispatch = useAppDispatch()
  const showWalletConnectModal = useWalletConnectModal()

  const onClickText = () => {
    if (isUnlocked) showWalletConnectModal()
  }
  const onClickReview = () => {
    if (isUnlocked) showWalletConnectModal()
  }
  const onClickDeny = () => {
    if (!isUnlocked) return
    if (isSessionPending) dispatch(rejectWcSession())
    else if (isReqPending) dispatch(rejectWcRequest())
  }
  const onClickDisconnect = () => {
    dispatch(disconnectWcClient())
    dispatch(resetWcClient())
  }

  return (
    <div css={style.container}>
      <Fade show={isActive}>
        <Box align="stretch" styles={style.content}>
          <div css={[style.status, { background: color }]}></div>
          <Box direction="column" margin="1.2em 2.3em 1.2em 1.2em">
            <h3 css={style.header} onClick={onClickText}>
              {header}
            </h3>
            <div css={style.description} onClick={onClickText}>
              {description}
            </div>
            {(isReqPending || isSessionPending) && (
              <Box margin="1em 0 0 0">
                <Button
                  color={Color.primaryWhite}
                  size="xs"
                  onClick={onClickDeny}
                  margin="0 1.2em 0 0"
                  disabled={!isUnlocked}
                >
                  Deny
                </Button>
                <Button size="xs" onClick={onClickReview} disabled={!isUnlocked}>
                  Review
                </Button>
              </Box>
            )}
          </Box>
          <button onClick={onClickDisconnect} title="Disconnect" css={style.closeButton}>
            <img src={CloseIcon} css={style.closeIcon} alt="Close" />
          </button>
        </Box>
      </Fade>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    position: 'fixed',
    bottom: '3.2em',
    right: '1em',
    [mq[1024]]: {
      right: '1.6em',
    },
    [mq[1200]]: {
      bottom: '3.5em',
      right: '2.1em',
    },
  },
  content: {
    background: Color.primaryWhite,
    border: `1px solid ${Color.borderMedium}`,
    borderLeft: 'none',
    borderBottom: 'none',
    boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.14)',
    borderRadius: 4,
  },
  status: {
    width: '1em',
    borderRadius: '4px 0 0 4px',
  },
  header: {
    fontSize: '1.1em',
    margin: '0 0 0.6em 0',
    ...Font.bold,
    ...Font.simpleLink,
  },
  description: {
    ...Font.body2,
    ...Font.simpleLink,
  },
  closeButton: {
    ...transparentButtonStyles,
    position: 'absolute',
    top: '-0.65em',
    right: '-0.45em',
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: Color.primaryWhite,
    borderRadius: '50%',
    boxShadow: '1px -1px 3px -1px rgb(0 0 0 / 15%)',
    border: '1px solid #EDEEEF',
    borderLeft: 'none',
    borderBottom: 'none',
    ':hover': {
      img: {
        filter: 'brightness(2)',
      },
    },
  },
  closeIcon: {
    opacity: 0.9,
    height: 20,
    width: 20,
    position: 'relative',
    top: -1,
    right: -1,
  },
}
