import { useEffect } from 'react'
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
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { sendCanceled, sendFailed, sendSucceeded } from 'src/features/send/sendSlice'
import { sendTokenActions } from 'src/features/send/sendToken'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

export function SendConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { transaction: tx, transactionError: txError } = useSelector(
    (state: RootState) => state.send
  )

  //-- need to make sure we belong on this screen
  useEffect(() => {
    if (!tx) {
      navigate('/send')
    }
  }, [tx])

  useEffect(() => {
    if (!tx) {
      return
    }
    const type = tx.comment
      ? TransactionType.StableTokenTransferWithComment
      : TransactionType.StableTokenTransfer
    dispatch(estimateFeeActions.trigger({ txs: [{ type }] }))
  }, [tx])

  const { amount, total, feeAmount, feeCurrency, feeEstimates } = useFee(tx?.amountInWei)

  const onGoBack = () => {
    dispatch(sendTokenActions.reset())
    dispatch(sendCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(sendTokenActions.trigger({ ...tx, feeEstimate: feeEstimates[0] }))
  }

  // TODO support requets
  const isRequest = false

  //TODO: Wrap the following in a hook to simplify?
  const { status: sagaStatus, error: sagaError } = useSelector(
    (state: RootState) => state.saga.sendToken
  )

  const isSagaWorking = sagaStatus === SagaStatus.Started

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

  if (!tx) return null

  return (
    <Box direction="column" styles={style.contentContainer}>
      {txError && <Notification message={txError.toString()} color={Color.borderError} />}

      <h1 css={Font.h2Green}>Review {isRequest ? 'Request' : 'Payment'}</h1>

      <Box direction="row" styles={style.inputRow}>
        <label css={style.inputLabel}>Amount</label>
        <Box direction="row" align="end">
          <MoneyValue amountInWei={amount} currency={tx.currency} baseFontSize={1.2} />
        </Box>
      </Box>

      <Box direction="row" styles={style.inputRow}>
        <label css={style.inputLabel}>Security Fee</label>
        {feeAmount && feeCurrency ? (
          <Box direction="row" align="end">
            <MoneyValue amountInWei={feeAmount} currency={feeCurrency} baseFontSize={1.2} />
            <img src={QuestionIcon} css={style.iconRight} />
          </Box>
        ) : (
          // TODO a proper loader (need to update mocks)
          <div>...</div>
        )}
      </Box>

      <Box direction="row" styles={style.inputRow}>
        <label css={{ ...style.inputLabel, ...Font.bold }}>Total</label>
        <Box direction="row" align="end">
          <MoneyValue
            amountInWei={total}
            currency={tx.currency}
            baseFontSize={1.2}
            amountCss={Font.bold}
          />
        </Box>
      </Box>

      <Box direction="row" styles={style.inputRow}>
        <label css={style.inputLabel}>Recipient</label>
        <Box direction="row" align="center">
          <Address address={tx.recipient} />
        </Box>
      </Box>

      <Box direction="row" styles={style.inputRow}>
        <label css={style.inputLabel}>Comment</label>
        <label css={style.valueLabel}>{tx.comment}</label>
      </Box>

      {isSagaWorking && (
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
          disabled={isSagaWorking || !feeAmount}
          margin="0 1em 0 0"
        >
          Edit {isRequest ? 'Request' : 'Payment'}
        </Button>
        <Button
          type="submit"
          size="m"
          onClick={onSend}
          icon={isRequest ? RequestPaymentIcon : SendPaymentIcon}
          disabled={isSagaWorking || !feeAmount}
        >
          Send {isRequest ? 'Request' : 'Payment'}
        </Button>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
    paddingLeft: '4em',
    paddingTop: '2em',
    width: '100%',
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
