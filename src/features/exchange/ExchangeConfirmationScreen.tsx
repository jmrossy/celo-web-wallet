import { utils } from 'ethers'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg'
import ExchangeIcon from 'src/components/icons/exchange_white.svg'
import QuestionIcon from 'src/components/icons/question_mark.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { Currency } from 'src/consts'
import { exchangeCanceled, exchangeFailed, exchangeSent } from 'src/features/exchange/exchangeSlice'
import { exchangeTokenActions, ExchangeTokenParams } from 'src/features/exchange/exchangeToken'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { useWeiExchange } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'

const emptyTransaction: ExchangeTokenParams = {
  amount: 0,
  fromCurrency: Currency.cUSD,
}

export function ExchangeConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const feeEstimate = useSelector((state: RootState) => state.fees.estimate)

  const { transaction: txn, toCELORate, transactionError: txnError } = useSelector(
    (state: RootState) => state.exchange
  )

  useEffect(() => {
    if (txn) {
      const type = TransactionType.TokenExchange
      dispatch(estimateFeeActions.trigger({ type }))
    }
  }, [txn])

  const { status: sagaStatus, error: sagaError } = useSelector(
    (state: RootState) => state.saga.exchangeToken
  )
  const isWorking = sagaStatus === SagaStatus.Started

  const safeTxn = txn ?? emptyTransaction //to avoid having to qualify every reference to txn
  const rate = safeTxn.fromCurrency === Currency.cUSD ? toCELORate : 1 / toCELORate
  // TODO sort out inconsistency in format btwn amount and fee
  const feeInStd = parseFloat(utils.formatEther(feeEstimate?.fee ?? 0))
  const exchange = useWeiExchange(safeTxn.amount, safeTxn.fromCurrency, rate, feeInStd)

  //-- need to make sure we belong on this screen
  useEffect(() => {
    if (!txn) {
      navigate('/exchange')
    }
  }, [txn])

  async function onGoBack() {
    dispatch(exchangeTokenActions.reset())
    dispatch(exchangeCanceled())
    navigate(-1)
  }

  async function onExchange() {
    if (!txn || !feeEstimate) return
    dispatch(exchangeTokenActions.trigger({ ...txn, feeEstimate }))
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Success) {
      //TODO: provide a notification of the success
      dispatch(exchangeTokenActions.reset())
      dispatch(exchangeSent())
      navigate('/')
    } else if (sagaStatus === SagaStatus.Failure) {
      dispatch(exchangeFailed(sagaError ? sagaError.toString() : 'Exchange failed'))
      //TODO: in the future, redirect them back to the exchange screen to deal with the error
    }
  }, [sagaStatus])

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        {txnError && <Notification message={txnError.toString()} color={Color.borderError} />}

        <h1 css={style.title}>Review Exchange</h1>

        <Box direction="row" styles={style.inputRow} align="end">
          <label css={style.inputLabel}>Amount</label>
          <MoneyValue
            amountInWei={exchange.from.weiAmount}
            currency={exchange.from.currency}
            baseFontSize={1.2}
          />
        </Box>

        <Box direction="row" align="end" styles={style.inputRow}>
          <label css={style.inputLabel}>Current Rate</label>
          <MoneyValue
            amountInWei={exchange.props.weiBasis}
            currency={exchange.from.currency}
            baseFontSize={1.2}
          />
          <span css={style.valueText}>to</span>
          <MoneyValue
            amountInWei={exchange.props.weiRate}
            currency={exchange.to.currency}
            baseFontSize={1.2}
          />
        </Box>

        <Box direction="row" styles={style.inputRow} align="end">
          <label css={style.inputLabel}>Security Fee</label>
          {feeEstimate ? (
            <Box direction="row" align="end">
              <MoneyValue
                amountInWei={exchange.props.weiFee}
                currency={feeEstimate.currency}
                baseFontSize={1.2}
              />
              <img src={QuestionIcon} css={style.iconRight} />
            </Box>
          ) : (
            // TODO a proper loader (need to update mocks)
            <div>Loading...</div>
          )}
        </Box>

        <Box direction="row" styles={style.inputRow} align="end">
          <label css={{ ...style.inputLabel, fontWeight: 'bolder' }}>Total</label>
          <MoneyValue
            amountInWei={exchange.to.weiAmount}
            currency={exchange.to.currency}
            baseFontSize={1.2}
          />
        </Box>

        {isWorking && (
          <Box direction="row" styles={style.inputRow}>
            <label css={style.valueText}>Working...</label>
          </Box>
        )}

        <Box direction="row" justify="start">
          <Button
            type="button"
            onClick={onGoBack}
            size="m"
            icon={ArrowBackIcon}
            color={Color.primaryGrey}
            disabled={isWorking}
            margin="0 1em 0 0"
          >
            Edit Exchange
          </Button>
          <Button
            type="button"
            onClick={onExchange}
            size="m"
            icon={ExchangeIcon}
            disabled={isWorking}
          >
            Make Exchange
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
  valueText: {
    fontSize: '1.2em',
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: '0 0.5em',
  },
}
