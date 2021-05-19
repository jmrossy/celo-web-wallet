import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Fade } from 'src/components/animation/Fade'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import CloseIcon from 'src/components/icons/close.svg'
import { Box } from 'src/components/layout/Box'
import { WalletConnectStatus } from 'src/features/walletConnect/types'
import { getPeerName } from 'src/features/walletConnect/utils'
import { useWalletConnectModal } from 'src/features/walletConnect/WalletConnectModal'
import { disconnectWcClient, rejectWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WalletConnectStatusBox() {
  const status = useSelector((s: RootState) => s.walletConnect.status)
  const session = useSelector((s: RootState) => s.walletConnect.session)

  const isActive =
    status >= WalletConnectStatus.SessionActive || status === WalletConnectStatus.Error
  const isReqPending = session && status === WalletConnectStatus.RequestPending

  const peerName = getPeerName(session, true)
  let header, description
  if (status === WalletConnectStatus.SessionActive) {
    header = 'WalletConnect Active'
    description = `Waiting for requests from ${peerName}`
  } else if (status === WalletConnectStatus.RequestPending) {
    header = 'Action Requested'
    description = `Review request from ${peerName}`
  } else if (status === WalletConnectStatus.RequestActive) {
    header = 'Action In Progress'
    description = 'Working on request...'
  } else if (status === WalletConnectStatus.RequestFailed) {
    header = 'Action Failed'
    description = 'Click here for details'
  } else if (status === WalletConnectStatus.Error) {
    header = 'WalletConnect Error'
    description = 'Click here for details'
  } else {
    header = 'Disconnecting'
    description = 'WalletConnect is closing'
  }

  const dispatch = useDispatch()
  const showWalletConnectModal = useWalletConnectModal()

  const onClickText = () => {
    showWalletConnectModal()
  }
  const onClickReview = () => {
    showWalletConnectModal()
  }
  const onClickDeny = () => {
    dispatch(rejectWcRequest())
  }
  const onClickDisconnect = () => {
    dispatch(disconnectWcClient())
  }

  return (
    <div css={style.container}>
      <Fade show={isActive}>
        <Box align="center" justify="between" styles={style.content}>
          <Box direction="column">
            <h3 css={style.header} onClick={onClickText}>
              {header}
            </h3>
            <div css={style.description} onClick={onClickText}>
              {description}
            </div>
            {isReqPending && (
              <Box margin="1em 0 0 0">
                <Button color={Color.altGrey} size="xs" onClick={onClickDeny} margin="0 1.2em 0 0">
                  Deny
                </Button>
                <Button size="xs" onClick={onClickReview}>
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
      right: '1.5em',
    },
    [mq[1200]]: {
      bottom: '3.5em',
      right: '2.1em',
    },
  },
  content: {
    background: Color.primaryWhite,
    border: `1px solid ${Color.borderMedium}`,
    boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.15)',
    borderRadius: 6,
    padding: '1.3em 1.5em',
    h3: {
      margin: '0 0 0.5em 0',
    },
  },
  header: {
    ...Font.h3,
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
