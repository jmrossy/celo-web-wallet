import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/Button'
import QuestionIcon from 'src/components/icons/question_mark.svg'
import RequestPaymentIcon from 'src/components/icons/request_payment.svg'
import SendPaymentIcon from 'src/components/icons/send_payment.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { sendCanceled, sendSucceeded } from 'src/features/send/sendSlice'
import { sendTokenActions } from 'src/features/send/sendToken'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
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

  const modal = useModal()

  const confirm = () => {
    modal.closeModal()
    modal.showModal('Payment Succeeded', 'Your payment has been successfully sent')
    dispatch(sendTokenActions.reset())
    dispatch(sendSucceeded())
    navigate('/')
  }

  const failure = (error: string | undefined) => {
    modal.closeModal()
    modal.showErrorModal('Payment Failed', 'Your payment could not be processed', error)
  }

  const onClose = () => {
    navigate('/')
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Started) modal.showWorkingModal('Sending Payment...')
    else if (sagaStatus === SagaStatus.Success) confirm()
    else if (sagaStatus === SagaStatus.Failure) failure(sagaError?.toString())
  }, [sagaStatus, sagaError])

  if (!tx) return null

  return (
    <ScreenContentFrame onClose={onClose}>
      {txError && <Notification message={txError.toString()} color={Color.borderError} />}
      <div css={style.content}>
        <h1 css={Font.h2Green}>Review {isRequest ? 'Request' : 'Payment'}</h1>

        <Box align="center" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Recipient</label>
          <Box direction="row" align="center" justify="end" styles={style.valueCol}>
            <Address address={tx.recipient} />
          </Box>
        </Box>

        {tx.comment && (
          <Box direction="row" styles={style.inputRow} justify="between">
            <label css={style.labelCol}>Comment</label>
            <label css={[style.valueLabel, style.valueCol]}>{tx.comment}</label>
          </Box>
        )}

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Value</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue amountInWei={amount} currency={tx.currency} baseFontSize={1.2} />
          </Box>
        </Box>

        <Box
          direction="row"
          styles={{ ...style.inputRow, ...style.bottomBorder }}
          align="end"
          justify="between"
        >
          <Box
            direction="row"
            justify="between"
            align="end"
            styles={{ ...style.labelCol, width: '10em' }}
          >
            <label>
              Fee <img src={QuestionIcon} css={style.icon} />
            </label>
          </Box>
          {feeAmount && feeCurrency ? (
            <Box justify="end" align="end" styles={style.valueCol}>
              <label>+</label>
              <MoneyValue
                amountInWei={feeAmount}
                currency={feeCurrency}
                baseFontSize={1.2}
                margin="0 0 0 0.25em"
              />
            </Box>
          ) : (
            // TODO a proper loader (need to update mocks)
            <div css={style.valueCol}>...</div>
          )}
        </Box>

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={[style.labelCol, style.totalLabel]}>Total</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue
              amountInWei={total}
              currency={tx.currency}
              baseFontSize={1.2}
              fontWeight={700}
            />
          </Box>
        </Box>

        <Box direction="row" justify="between" margin={'3em 0 0 0'}>
          <Button
            type="button"
            size="m"
            color={Color.altGrey}
            onClick={onGoBack}
            disabled={isSagaWorking || !feeAmount}
            margin="0 2em 0 0"
            width="5em"
          >
            Back
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
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '23em',
  },
  inputRow: {
    marginBottom: '1.4em',
    [mq[1200]]: {
      marginBottom: '1.6em',
    },
  },
  labelCol: {
    ...Font.inputLabel,
    color: Color.primaryGrey,
    width: '9em',
    marginRight: '1em',
    [mq[1200]]: {
      width: '11em',
    },
  },
  valueCol: {
    width: '12em',
    textAlign: 'end',
  },
  totalLabel: {
    color: Color.primaryGrey,
    fontWeight: 600,
  },
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: '1.2em',
    fontWeight: 400,
  },
  bottomBorder: {
    paddingBottom: '1.25em',
    borderBottom: `1px solid ${Color.borderMedium}`,
  },
  iconRight: {
    marginLeft: '0.5em',
  },
  icon: {
    marginBottom: '-0.3em',
  },
}
