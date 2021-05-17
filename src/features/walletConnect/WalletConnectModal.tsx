import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import WalletConnectIcon from 'src/components/icons/logos/wallet_connect.svg'
import PasteIcon from 'src/components/icons/paste.svg'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import {
  SessionType,
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
} from 'src/features/walletConnect/utils'
import { validateWalletConnectForm } from 'src/features/walletConnect/walletConnect'
import {
  approveWcSession,
  disconnectWcClient,
  initializeWcClient,
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

export function useWalletConnectModal() {
  const { showModalWithContent, closeModal } = useModal()
  return () => {
    showModalWithContent({
      head: 'WalletConnect',
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
  const { status, session, error } = useSelector((s: RootState) => s.walletConnect)

  return (
    <>
      {status === WalletConnectStatus.Disconnected && <ConnectionForm />}
      {status === WalletConnectStatus.Initializing && <LoadingIndicator />}
      {status === WalletConnectStatus.SessionPending && <ReviewSession session={session} />}
      {status >= WalletConnectStatus.SessionActive && (
        <ViewSession session={session} close={close} />
      )}
      {status === WalletConnectStatus.Error && <ReviewError message={error} close={close} />}
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

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
  } = useCustomForm<WalletConnectUriForm>(initialValues, onSubmit, validateWalletConnectForm)

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

function LoadingIndicator() {
  return (
    <Box direction="column" align="center" margin="1.5em">
      <h3 css={style.h3}>Connecting...</h3>
      <div css={style.spinnerContainer}>
        <Spinner />
      </div>
    </Box>
  )
}

function ReviewSession({ session }: { session: WalletConnectSession | null }) {
  if (!session || session.type !== SessionType.Pending) {
    throw new Error('Invalid WalletConnect session for review')
  }

  const dispatch = useDispatch()
  const onClickApprove = () => {
    dispatch(approveWcSession())
  }
  const onClickReject = () => {
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
        <Button size="s" margin="0 1.5em 0 0" onClick={onClickReject} color={Color.altGrey}>
          Reject
        </Button>
        <Button size="s" onClick={onClickApprove}>
          Approve
        </Button>
      </Box>
    </Box>
  )
}

function ViewSession({ session, close }: { session: WalletConnectSession | null } & Props) {
  if (!session || session.type !== SessionType.Settled) {
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
      <h3 css={style.h3}>{`Connected to ${peerName}!`}</h3>
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
        <Button size="s" margin="0 1.5em 0 0" onClick={onClickDisconnect} color={Color.altGrey}>
          Disconnect
        </Button>
        <Button size="s" onClick={onClickOkay}>
          Okay
        </Button>
      </Box>
    </Box>
  )
}

function ReviewError({ message, close }: { message: string | null } & Props) {
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
        <Button size="s" margin="0 2em 0 0" onClick={onClickDismiss} color={Color.altGrey}>
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
    margin: 0,
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
    opacity: 0.9,
  },
}
