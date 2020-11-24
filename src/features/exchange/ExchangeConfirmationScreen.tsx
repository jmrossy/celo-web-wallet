import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg'
import ExchangeIcon from 'src/components/icons/exchange_white.svg'
import QuestionIcon from 'src/components/icons/question_mark.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { Currency } from 'src/consts'
import { fetchExchangeRateActions } from 'src/features/exchange/exchangeRate'
import { exchangeCanceled, exchangeSent } from 'src/features/exchange/exchangeSlice'
import { exchangeTokenActions } from 'src/features/exchange/exchangeToken'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { useExchangeValues } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'

export function ExchangeConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { transaction: tx, cUsdToCelo, transactionError: txnError } = useSelector(
    (state: RootState) => state.exchange
  )

  useEffect(() => {
    if (!tx) {
      return
    }

    dispatch(
      fetchExchangeRateActions.trigger({
        sellGold: tx.fromCurrency === Currency.CELO,
        sellAmount: tx.amountInWei,
        force: true,
      })
    )

    const approveType =
      tx.fromCurrency === Currency.CELO
        ? TransactionType.CeloTokenApprove
        : TransactionType.StableTokenApprove

    dispatch(
      estimateFeeActions.trigger({
        preferredCurrency: tx.fromCurrency,
        txs: [{ type: approveType }, { type: TransactionType.TokenExchange }],
      })
    )
  }, [tx])

  // TODO show totalIn as shown in new designs
  const { total: totalIn, feeAmount, feeCurrency, feeEstimates } = useFee(tx?.amountInWei, 2)

  const { from, to, rate } = useExchangeValues(
    tx?.amountInWei,
    tx?.fromCurrency,
    cUsdToCelo?.rate,
    true
  )

  const { status: sagaStatus, error: sagaError } = useSelector(
    (state: RootState) => state.saga.exchangeToken
  )
  const isWorking = sagaStatus === SagaStatus.Started

  //-- need to make sure we belong on this screen
  useEffect(() => {
    if (!tx) {
      navigate('/exchange')
    }
  }, [tx])

  async function onGoBack() {
    dispatch(exchangeTokenActions.reset())
    dispatch(exchangeCanceled())
    navigate(-1)
  }

  async function onExchange() {
    if (!tx || !cUsdToCelo || !feeEstimates) return
    dispatch(exchangeTokenActions.trigger({ ...tx, exchangeRate: cUsdToCelo, feeEstimates }))
  }

  const modal = useModal()

  const confirm = () => {
    modal.closeModal()
    modal.showModal('Exchange Succeeded', 'Your exchange has been completed successfully')
    dispatch(exchangeTokenActions.reset())
    dispatch(exchangeSent())
    navigate('/')
  }

  const failure = (error: string | undefined) => {
    modal.closeModal()
    modal.showErrorModal('Exchange Failed', 'Your exchange could not be processed', error)
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Started) modal.showWorkingModal('Exchanging...')
    else if (sagaStatus === SagaStatus.Success) confirm()
    else if (sagaStatus === SagaStatus.Failure) failure(sagaError?.toString())
  }, [sagaStatus, sagaError])

  if (!tx) return null

  return (
    <ScreenContentFrame>
      {txnError && <Notification message={txnError.toString()} color={Color.borderError} />}
      <h1 css={[Font.h2Green, style.pageTitle]}>Review Exchange</h1>
      <Box direction="row" align="start">
        <Box direction="column">
          <Box direction="row" styles={style.inputRow} align="end">
            <label css={[style.inputLabel, style.labelWidth]}>Value</label>
            <MoneyValue
              amountInWei={from.weiAmount}
              currency={from.currency}
              baseFontSize={1.2}
              spanCss={style.valueWidth}
            />
          </Box>

          <Box
            direction="row"
            styles={{ ...style.inputRow, ...style.bottomBorder }}
            align="end"
            justify="between"
          >
            <Box direction="row" justify="between" align="end" styles={style.labelWidth}>
              <label css={style.feeLabel}>
                Fee <img src={QuestionIcon} css={style.icon} />
              </label>
            </Box>
            {feeAmount && feeCurrency ? (
              <Box styles={style.valueWidth} justify="end" align="end">
                <label css={{ ...style.feeLabel, marginRight: '0.25em' }}>+</label>
                <MoneyValue amountInWei={feeAmount} currency={feeCurrency} baseFontSize={1.2} />
              </Box>
            ) : (
              // TODO a proper loader (need to update mocks)
              <div css={style.valueWidth}>...</div>
            )}
          </Box>

          <Box direction="row" styles={style.inputRow} align="end">
            <label css={[style.totalLabel, style.labelWidth]}>Total In</label>
            <MoneyValue
              amountInWei={totalIn}
              currency={from.currency}
              baseFontSize={1.2}
              spanCss={style.valueWidth}
              fontWeight={700}
            />
          </Box>

          <Box direction="row" styles={style.inputRow} align="end">
            <label css={[style.totalLabel, style.labelWidth]}>Total Out</label>
            <MoneyValue
              amountInWei={to.weiAmount}
              currency={to.currency}
              baseFontSize={1.2}
              spanCss={style.valueWidth}
              fontWeight={700}
            />
          </Box>

          <Box direction="row" justify="between" margin={'3em 0 0 0'}>
            <Button
              type="button"
              onClick={onGoBack}
              size="m"
              icon={ArrowBackIcon}
              color={Color.altGrey}
              disabled={isWorking}
              margin="0 2em 0 0"
              width="6em"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={onExchange}
              size="m"
              width="9em"
              icon={ExchangeIcon}
              disabled={isWorking || !feeAmount || !cUsdToCelo}
            >
              Exchange
            </Button>
          </Box>
        </Box>
        <Box direction="column" align="center" styles={style.rateBox}>
          <label css={style.rateLabel}>Rate</label>
          {cUsdToCelo ? (
            <>
              <MoneyValue
                amountInWei={rate.weiBasis}
                currency={from.currency}
                baseFontSize={1.2}
                margin={'0 0 0.5em 0'}
              />
              <span css={style.valueText}>=</span>
              <MoneyValue
                amountInWei={rate.weiRate}
                currency={to.currency}
                baseFontSize={1.2}
                margin={'0.5em 0 0 0'}
              />
            </>
          ) : (
            // TODO a proper loader (need to update mocks)
            <span css={style.valueText}>...</span>
          )}
        </Box>
      </Box>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  pageTitle: {
    marginTop: 0,
  },
  inputRow: {
    marginBottom: '1.25em',
  },
  labelWidth: {
    width: '9em',
    marginRight: '1em',
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
  },
  totalLabel: {
    fontWeight: 700,
    fontSize: '1.1em',
    color: Color.primaryGrey,
  },
  valueWidth: {
    width: '7em',
    textAlign: 'end',
  },
  valueText: {
    fontSize: '1.2em',
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: '0 0.5em',
    width: '',
  },
  feeLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
  },
  rateBox: {
    background: Color.fillLight,
    padding: '1em 3em',
    marginLeft: '2em',
  },
  rateLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
    marginBottom: '0.5em',
  },
  bottomBorder: {
    paddingBottom: '0.25em',
    borderBottom: `1px solid ${Color.borderLight}`,
  },
  icon: {
    marginBottom: '-0.3em',
  },
}
