import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import PasteIcon from 'src/components/icons/paste.svg'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import {
  SessionType,
  WalletConnectSession,
  WalletConnectStatus,
  WalletConnectUriForm,
} from 'src/features/walletConnect/types'
import { validateWalletConnectForm } from 'src/features/walletConnect/walletConnect'
import {
  approveWcSession,
  initializeWcClient,
  rejectWcSession,
  resetWcClient,
} from 'src/features/walletConnect/walletConnectSlice'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'
import { useCustomForm } from 'src/utils/useCustomForm'

export function useWalletConnectModal() {
  const { showModalWithContent, closeModal } = useModal()
  return () => {
    showModalWithContent('WalletConnect', <WalletConnectModal close={closeModal} />)
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
      {status >= WalletConnectStatus.SessionActive && <ViewSession session={session} />}
      {status === WalletConnectStatus.Error && <ReviewError message={error} close={close} />}
    </>
  )
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
      <Box direction="column" align="center" margin="1.5em 0 0 0">
        <div css={style.modalText}>
          Copy the WalletConnect session info and paste it here to connect.
        </div>
        <Box direction="row" align="center">
          <TextInput
            width="20em"
            name="uri"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.uri}
            placeholder="wc:0123..."
            {...errors['uri']}
          />
          {isClipboardReadSupported() && (
            <Button
              size="icon"
              type="button"
              margin="0 0 0 0.5em"
              onClick={onClickPaste}
              icon={PasteIcon}
              iconStyles={style.pasteIcon}
            />
          )}
        </Box>
        <Button type="submit" margin="1.75em 0 0.25em 0">
          Connect
        </Button>
      </Box>
    </form>
  )
}

function LoadingIndicator() {
  return (
    <div css={style.spinner}>
      <Spinner />
    </div>
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

  return (
    <Box direction="column" align="center" margin="2em 0 1.5em 0">
      <div>{JSON.stringify(session)}</div>
      <Box direction="row">
        <Button size="s" margin="0 2em 0 " onClick={onClickReject} color={Color.altGrey}>
          Reject
        </Button>
        <Button size="s" onClick={onClickApprove}>
          Approve
        </Button>
      </Box>
    </Box>
  )
}

function ViewSession({ session }: { session: WalletConnectSession | null }) {
  if (!session || session.type !== SessionType.Settled) {
    throw new Error('Invalid WalletConnect session to view')
  }
  return (
    <Box direction="column" align="center" margin="2em 0 0 0">
      <div>{JSON.stringify(session)}</div>
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
    <Box direction="column" align="center" margin="2em 0 0 0">
      <h3>Looks like something went wrong</h3>
      <div>{message ?? 'Unknown error'}</div>
      <Box direction="row" margin="1.5em 0 0 0">
        <Button size="s" margin="0 2em 0 " onClick={onClickDismiss} color={Color.altGrey}>
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
  modalText: {
    fontSize: '1.1em',
    textAlign: 'center',
    maxWidth: '18em',
    lineHeight: '1.5em',
    marginBottom: '1em',
  },
  pasteIcon: {
    height: '1.25em',
  },
  spinner: {
    marginTop: '2.5em',
  },
}
