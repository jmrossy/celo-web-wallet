import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg'
import QuestionIcon from 'src/components/icons/question_mark.svg'
import RequestPaymentIcon from 'src/components/icons/request_payment_white.svg'
import SendPaymentIcon from 'src/components/icons/send_payment_white.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { sendCanceled, sendFailed, sendSucceeded } from 'src/features/send/sendSlice'
import { sendTokenActions } from 'src/features/send/sendToken'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { useWeiTransaction } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'

export function SendConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { transaction: txn, transactionError: txnError } = useSelector(
    (state: RootState) => state.send
  )
  const isRequest = useMemo(() => {
    return false
  }, [txn])
  const { wei } = useWeiTransaction(txn?.amount ?? 0, 0.02) //TODO: get the actual fee

  //TODO: Wrap the following in a hook to simplify?
  const { status: sagaStatus, error: sagaError } = useSelector(
    (state: RootState) => state.saga.sendToken
  )
  const isWorking = sagaStatus === SagaStatus.Started

  //-- need to make sure we belong on this screen
  useEffect(() => {
    if (!txn) {
      navigate('/send')
    }
  }, [txn])

  async function onGoBack() {
    dispatch(sendTokenActions.reset())
    dispatch(sendCanceled())
    navigate(-1)
  }

  async function onSend() {
    if (!txn) return
    dispatch(sendTokenActions.trigger(txn))
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Success) {
      //TODO: provide a notification of the success
      dispatch(sendTokenActions.reset())
      dispatch(sendSucceeded())
      navigate('/')
    } else if (sagaStatus === SagaStatus.Failure) {
      dispatch(sendFailed(sagaError ? sagaError.toString() : 'Send failed'))
      //TODO: in the future, redirect them back to the exchange screen to deal with the error
    }
  }, [sagaStatus])

  if (!txn) return null //to avoid having to qualify everything below

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        {txnError && <Notification message={txnError.toString()} color={Color.borderError} />}

        <h1 css={style.title}>Review {isRequest ? 'Request' : 'Payment'}</h1>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Amount</label>
          <Box direction="row" align="end">
            <MoneyValue amountInWei={wei.amount} currency={txn.currency} baseFontSize={1.2} />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Security Fee</label>
          <Box direction="row" align="end">
            <MoneyValue amountInWei={wei.fee} currency={txn.currency} baseFontSize={1.2} />
            <img src={QuestionIcon} css={style.iconRight} />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={{ ...style.inputLabel, fontWeight: 'bolder' }}>Total</label>
          <Box direction="row" align="end">
            <MoneyValue
              amountInWei={wei.total}
              currency={txn.currency}
              baseFontSize={1.2}
              amountCss={{ fontWeight: 'bolder' }}
            />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Recipient</label>
          <Box direction="row" align="center">
            <Address address={txn.recipient} />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Comment</label>
          <label css={style.valueLabel}>{txn.comment}</label>
        </Box>

        {isWorking && (
          <Box direction="row" styles={style.inputRow}>
            <label css={style.valueText}>Sending...</label>
          </Box>
        )}

        <Box direction="row" justify="start">
          <Button
            type="button"
            size="m"
            color={Color.primaryGrey}
            onClick={onGoBack}
            icon={ArrowBackIcon}
            disabled={isWorking}
            margin="0 1em 0 0"
          >
            Edit {isRequest ? 'Request' : 'Payment'}
          </Button>
          <Button
            type="submit"
            size="m"
            onClick={onSend}
            icon={isRequest ? RequestPaymentIcon : SendPaymentIcon}
            disabled={isWorking}
          >
            Send {isRequest ? 'Request' : 'Payment'}
          </Button>
        </Box>
      </Box>
    </ScreenFrameWithFeed>
  )
}

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
    paddingLeft: '4em',
    paddingTop: '2em',
    width: '100%',
  },
  title: {
    color: Color.accentBlue,
    fontWeight: 400,
    fontSize: '2em',
    marginTop: 0,
    marginBottom: '1em',
  },
  inputRow: {
    marginBottom: '2em',
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
    width: '6em',
    marginRight: '1em',
  },
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: '1.2em',
    fontWeight: 400,
  },
  iconRight: {
    marginLeft: '0.5em',
  },
}
