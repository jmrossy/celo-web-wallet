import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import { CheckmarkInElipseIcon } from 'src/components/icons/Checkmark'
import WalletConnectIcon from 'src/components/icons/logos/wallet_connect.svg'
import PasteIcon from 'src/components/icons/paste.svg'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { RequestDetails } from 'src/features/walletConnect/RequestDetails'
import {
  SessionStatus,
  WalletConnectSession,
  WalletConnectStatus,
  WalletConnectUriForm,
} from 'src/features/walletConnect/types'
import {
  getExpiryTime,
  getPeerName,
  getPeerUrl,
  getPermissionList,
  getStartTime,
  rpcMethodToLabel,
  validateWalletConnectForm,
} from 'src/features/walletConnect/utils'
import {
  approveWcRequest,
  approveWcSession,
  disconnectWcClient,
  dismissWcRequest,
  initializeWcClient,
  rejectWcRequest,
  rejectWcSession,
  resetWcClient,
} from 'src/features/walletConnect/walletConnectSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'
import { trimToLength } from 'src/utils/string'
import { useCustomForm } from 'src/utils/useCustomForm'
import type { SessionTypes } from 'wcv2/types'

export function useWalletConnectModal() {
  const { showModalWithContent, closeModal } = useModal()
  return () => {
    showModalWithContent({
      head: 'WalletConnect (Beta)',
      content: <WalletConnectModal close={closeModal} />,
      headIcon: <Icon />,
    })
  }
}

const initialValues: WalletConnectUriForm = {
  uri: '',
}

interface Props {
  close: () => void
}

function WalletConnectModal({ close }: Props) {
  const { status, session, request, error } = useSelector((s: RootState) => s.walletConnect)

  return (
    <>
      {status === WalletConnectStatus.Disconnected && <ConnectionForm />}
      {status === WalletConnectStatus.Initializing && <LoadingIndicator text="Connecting..." />}
      {status === WalletConnectStatus.SessionPending && <ReviewSession session={session} />}
      {status === WalletConnectStatus.SessionActive && (
        <ViewSession session={session} close={close} />
      )}
      {status === WalletConnectStatus.RequestPending && (
        <ReviewRequest session={session} request={request} close={close} />
      )}
      {status === WalletConnectStatus.RequestActive && <LoadingIndicator text="Working..." />}
      {status === WalletConnectStatus.RequestComplete && <RequestComplete close={close} />}
      {status === WalletConnectStatus.RequestFailed && (
        <RequestError message={error} close={close} />
      )}
      {status === WalletConnectStatus.Error && <SessionError message={error} close={close} />}
    </>
  )
}

function Icon() {
  return <img src={WalletConnectIcon} css={style.wcIcon} alt="WalletConnect Icon" />
}

function ConnectionForm() {
  const dispatch = useDispatch()

  const onSubmit = () => {
    dispatch(initializeWcClient(values.uri))
  }

  const { values, errors, handleChange, handleBlur, handleSubmit, setValues } =
    useCustomForm<WalletConnectUriForm>(initialValues, onSubmit, validateWalletConnectForm)

  const onClickPaste = async () => {
    const value = await tryClipboardGet()
    if (value) {
      setValues({ ...values, uri: value })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <h3 css={style.h3}>Copy the WalletConnect session info and paste it here to connect.</h3>
        <Box direction="row" align="center" margin="1.5em 0 0 0">
          <TextInput
            name="uri"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.uri}
            placeholder="wc:0123..."
            autoFocus={true}
            inputStyles={style.uriInput}
            {...errors['uri']}
          />
          {isClipboardReadSupported() && (
            <Button
              size="icon"
              height={42} // should match input height + padding
              width={42}
              type="button"
              margin="0 0 0 0.5em"
              onClick={onClickPaste}
              icon={PasteIcon}
              iconStyles={style.pasteIcon}
              title="Paste"
            />
          )}
        </Box>
        <Button size="s" type="submit" margin="1.8em 0 0.25em 0" height={42}>
          Connect
        </Button>
      </Box>
    </form>
  )
}

function LoadingIndicator({ text }: { text: string }) {
  return (
    <Box direction="column" align="center" margin="1.5em">
      <h3 css={style.h3}>{text}</h3>
      <div css={style.spinnerContainer}>
        <Spinner />
      </div>
    </Box>
  )
}

function ReviewSession({ session }: { session: WalletConnectSession | null }) {
  if (!session || session.status !== SessionStatus.Pending) {
    throw new Error('Invalid WalletConnect session for review')
  }

  const dispatch = useDispatch()
  const onClickApprove = () => {
    dispatch(approveWcSession())
  }
  const onClickDeny = () => {
    dispatch(rejectWcSession())
  }

  const peerName = getPeerName(session)
  const peerUrl = getPeerUrl(session)

  return (
    <Box direction="column" align="center">
      <h3 css={style.h3}>{`${peerName} would like to connect to your wallet`}</h3>
      <label css={style.label}>Requested permissions:</label>
      <div css={style.details}>{getPermissionList(session)}</div>
      {peerUrl && (
        <TextLink link={peerUrl} styles={style.dappUrl}>
          {trimToLength(peerUrl, 70)}
        </TextLink>
      )}
      <Box direction="row" margin="2em 0 0.25em 0">
        <Button size="s" margin="0 1.5em 0 0" onClick={onClickDeny} color={Color.primaryWhite}>
          Deny
        </Button>
        <Button size="s" onClick={onClickApprove}>
          Approve
        </Button>
      </Box>
    </Box>
  )
}

function ViewSession({ session, close }: { session: WalletConnectSession | null } & Props) {
  if (!session || session.status !== SessionStatus.Settled) {
    throw new Error('Invalid WalletConnect session to view')
  }

  const dispatch = useDispatch()
  const onClickOkay = () => {
    close()
  }
  const onClickDisconnect = () => {
    dispatch(disconnectWcClient())
  }

  const peerName = getPeerName(session)
  const peerUrl = getPeerUrl(session)
  const start = getStartTime(session)
  const expiry = getExpiryTime(session)

  return (
    <Box direction="column" align="center">
      <h3 css={style.h3}>{`Connected to ${peerName}`}</h3>
      <Box align="center">
        <div css={[style.details, { marginRight: '1em' }]}>Connected since:</div>
        <div css={style.details}>{start}</div>
      </Box>
      <Box align="center">
        <div css={[style.details, { marginRight: '1em' }]}>Session expires:</div>
        <div css={style.details}>{expiry}</div>
      </Box>
      {peerUrl && (
        <TextLink link={peerUrl} styles={style.dappUrl}>
          {trimToLength(peerUrl, 70)}
        </TextLink>
      )}
      <Box direction="row" margin="2em 0 0.25em 0">
        <Button
          size="s"
          margin="0 1.5em 0 0"
          onClick={onClickDisconnect}
          color={Color.primaryWhite}
        >
          Disconnect
        </Button>
        <Button size="s" onClick={onClickOkay}>
          Okay
        </Button>
      </Box>
    </Box>
  )
}

function ReviewRequest({
  session,
  request,
  close,
}: {
  session: WalletConnectSession | null
  request: SessionTypes.RequestEvent | null
} & Props) {
  if (session?.status !== SessionStatus.Settled || !request?.request) {
    throw new Error('Invalid WalletConnect request for review')
  }

  const dispatch = useDispatch()
  const onClickApprove = () => {
    dispatch(approveWcRequest())
  }
  const onClickDeny = () => {
    dispatch(rejectWcRequest())
    close()
  }

  const peerName = getPeerName(session)
  const peerUrl = getPeerUrl(session)
  const requestMethod = rpcMethodToLabel(request.request.method)

  return (
    <Box direction="column" align="center">
      <h3 css={style.h3}>{`${peerName} would like to ${requestMethod}`}</h3>
      <RequestDetails requestEvent={request} />
      {peerUrl && (
        <TextLink link={peerUrl} styles={style.dappUrl}>
          {trimToLength(peerUrl, 70)}
        </TextLink>
      )}
      <Box direction="row" margin="1.5em 0 0.25em 0">
        <Button size="s" margin="0 1.5em 0 0" onClick={onClickDeny} color={Color.primaryWhite}>
          Deny
        </Button>
        <Button size="s" onClick={onClickApprove}>
          Approve
        </Button>
      </Box>
    </Box>
  )
}
function RequestComplete({ close }: Props) {
  useEffect(() => {
    return close
  }, [])

  return (
    <Box direction="column" align="center">
      <h3 css={style.h3}>Request Complete!</h3>
      <div css={{ marginTop: '1em' }}>
        <CheckmarkInElipseIcon />
      </div>
    </Box>
  )
}

function RequestError({ message, close }: { message: string | null } & Props) {
  const dispatch = useDispatch()
  const onClickDismiss = () => {
    dispatch(dismissWcRequest())
    close()
  }
  return (
    <Box direction="column" align="center">
      <h3 css={style.h3}>There was a problem with a WalletConnect request event</h3>
      <p css={style.error}>{message ?? 'Unknown error'}</p>
      <Button size="s" margin="2em 0 0.5em 0" onClick={onClickDismiss} color={Color.primaryWhite}>
        Dismiss
      </Button>
    </Box>
  )
}

function SessionError({ message, close }: { message: string | null } & Props) {
  const dispatch = useDispatch()
  const onClickDismiss = () => {
    dispatch(resetWcClient())
    close()
  }
  const onClickNewSession = () => {
    dispatch(resetWcClient())
  }
  return (
    <Box direction="column" align="center">
      <h3 css={style.h3}>Looks like something went wrong</h3>
      <p css={style.error}>{message ?? 'Unknown error'}</p>
      <Box direction="row" margin="2em 0 0.5em 0">
        <Button size="s" margin="0 1.5em 0 0" onClick={onClickDismiss} color={Color.primaryWhite}>
          Dismiss
        </Button>
        <Button size="s" onClick={onClickNewSession}>
          New Session
        </Button>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  h3: {
    ...modalStyles.h3,
    maxWidth: '18em',
  },
  uriInput: {
    width: '14em',
    [mq[1024]]: {
      width: '16em',
    },
  },
  label: {
    ...modalStyles.p,
    ...Font.bold,
    maxWidth: '22em',
  },
  details: {
    ...modalStyles.p,
    maxWidth: '22em',
    margin: '0.5em 0 0 0',
  },
  dappUrl: {
    margin: '1.2em 0 0 0',
    textAlign: 'center',
    maxWidth: '24em',
    fontSize: '1em',
  },
  error: {
    ...modalStyles.p,
    color: Color.textError,
  },
  wcIcon: {
    height: '1em',
    width: '1.2em',
    filter: 'saturate(0) brightness(0.4)',
    paddingTop: 4,
  },
  pasteIcon: {
    height: 22,
  },
  spinnerContainer: {
    marginTop: '1.5em',
    transform: 'scale(0.8)',
    opacity: 0.85,
  },
}
