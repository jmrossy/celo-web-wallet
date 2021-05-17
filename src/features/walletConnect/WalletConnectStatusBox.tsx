import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Fade } from 'src/components/animation/Fade'
import { Button } from 'src/components/buttons/Button'
import { CloseButton } from 'src/components/buttons/CloseButton'
import { Box } from 'src/components/layout/Box'
import {
  SessionType,
  WalletConnectSession,
  WalletConnectStatus,
} from 'src/features/walletConnect/types'
import { disconnectWcClient, rejectWcRequest } from 'src/features/walletConnect/walletConnectSlice'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export function WalletConnectStatusBox() {
  const status = useSelector((s: RootState) => s.walletConnect.status)
  const session = useSelector((s: RootState) => s.walletConnect.session)

  const isActive = status >= WalletConnectStatus.SessionActive // TODO || error
  const isReqPending = session && status === WalletConnectStatus.RequestPending

  const peerName = getPeerName(session)
  const header = isReqPending ? 'WalletConnect Action Requested' : 'WalletConnect Active'
  const description = isReqPending ? `Review request from ${peerName}` : 'Waiting for requests'

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onClickReview = () => {
    navigate('walletConnect-review')
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
        <Box align="center">
          <Box direction="column" styles={style.content}>
            <h3>{header}</h3>
            <div>{description}</div>
            {isReqPending && (
              <Box>
                <Button color={Color.altGrey} size="xs" onClick={onClickDeny}>
                  Deny
                </Button>
                <Button size="xs" onClick={onClickReview}>
                  Review
                </Button>
              </Box>
            )}
          </Box>
          <CloseButton onClick={onClickDisconnect} title="Disconnect" />
        </Box>
      </Fade>
    </div>
  )
}

function getPeerName(session: WalletConnectSession | null) {
  if (session?.type === SessionType.Pending)
    return session.data.proposer?.metadata?.name || 'Unknown Dapp'
  if (session?.type === SessionType.Settled)
    return session.data.peer?.metadata?.name || 'Unknown Dapp'
  return null
}

const style: Stylesheet = {
  container: {
    position: 'fixed',
    bottom: '2em',
    right: '2em',
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
}
