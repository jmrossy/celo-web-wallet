import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { isSignerLedger } from 'src/blockchain/signer'
import { Button } from 'src/components/buttons/Button'
import { HelpIcon } from 'src/components/icons/HelpIcon'
import ExchangeIcon from 'src/components/icons/swap.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { Currency } from 'src/currency'
import { fetchExchangeRateActions } from 'src/features/exchange/exchangeRate'
import { exchangeCanceled, exchangeSent } from 'src/features/exchange/exchangeSlice'
import { exchangeTokenActions } from 'src/features/exchange/exchangeToken'
import { useExchangeValues } from 'src/features/exchange/utils'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { SignatureRequiredModal } from 'src/features/ledger/animation/SignatureRequiredModal'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

export function ExchangeConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { transaction: tx, transactionError: txnError, cUsdToCelo, numSignatures } = useSelector(
    (state: RootState) => state.exchange
  )

  useEffect(() => {
    if (!tx) {
      // Make sure we belong on this screen
      navigate('/exchange')
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

  const { total: totalIn, feeAmount, feeCurrency, feeEstimates } = useFee(tx?.amountInWei, 2)

  const { from, to, rate } = useExchangeValues(tx?.amountInWei, tx?.fromCurrency, cUsdToCelo, true)

  // TODO: DRY up code below with Exchange conf screen into singer-loader-fail/success modal hook
  const { status: sagaStatus, error: sagaError } = useSelector(
    (state: RootState) => state.saga.exchangeToken
  )
  const isWorking = sagaStatus === SagaStatus.Started

  async function onGoBack() {
    dispatch(exchangeTokenActions.reset())
    dispatch(exchangeCanceled())
    navigate(-1)
  }

  async function onExchange() {
    if (!tx || !cUsdToCelo || !feeEstimates) return
    dispatch(exchangeTokenActions.trigger({ ...tx, exchangeRate: rate, feeEstimates }))
  }

  const { showSuccessModal, showErrorModal, showWorkingModal, showModalWithContent } = useModal()

  const onNeedSignature = (index: number) => {
    const modalText = [
      'Exchanges require two transactions',
      'Confirm both transactions on your Ledger',
    ]
    showModalWithContent(
      `Signature Required (${index}/2)`,
      <SignatureRequiredModal text={modalText} />,
      null,
      null,
      null,
      false
    )
  }

  const onSuccess = () => {
    showSuccessModal('Exchange Complete!', 'Your exchange has been made successfully')
    dispatch(exchangeTokenActions.reset())
    dispatch(exchangeSent())
    navigate('/')
  }

  const onFailure = (error: string | undefined) => {
    showErrorModal('Exchange Failed', 'Your exchange could not be processed', error)
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Started) {
      if (isSignerLedger() && numSignatures === 0) onNeedSignature(1)
      else if (isSignerLedger() && numSignatures === 1) onNeedSignature(2)
      else showWorkingModal('Exchanging...')
    } else if (sagaStatus === SagaStatus.Success) {
      onSuccess()
    } else if (sagaStatus === SagaStatus.Failure) {
      onFailure(sagaError?.toString())
    }
  }, [sagaStatus, sagaError, numSignatures])

  if (!tx) return null

  return (
    <ScreenContentFrame>
      {txnError && <Notification message={txnError.toString()} color={Color.borderError} />}
      <h1 css={Font.h2Green}>Review Exchange</h1>
      <div css={style.container}>
        <Box direction="column">
          <Box direction="row" styles={style.inputRow} align="end" justify="between">
            <label css={[style.label, style.labelWidth]}>Value</label>
            <MoneyValue
              amountInWei={from.weiAmount}
              currency={from.currency}
              baseFontSize={1.2}
              containerCss={style.valueWidth}
            />
          </Box>

          <Box
            direction="row"
            styles={{ ...style.inputRow, ...style.bottomBorder }}
            align="end"
            justify="between"
          >
            <Box direction="row" justify="between" align="end" styles={style.labelWidth}>
              <label css={style.label}>
                Fee{' '}
                <HelpIcon
                  tooltip={{
                    content: "Fees, or 'gas', keep the network secure.",
                    position: 'topRight',
                  }}
                />
              </label>
            </Box>
            {feeAmount && feeCurrency ? (
              <Box styles={style.valueWidth} justify="end" align="end">
                <label css={{ ...style.label, marginRight: '0.25em' }}>+</label>
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
              containerCss={style.valueWidth}
              fontWeight={700}
            />
          </Box>

          <Box direction="row" styles={style.inputRow} align="end">
            <label css={[style.totalLabel, style.labelWidth]}>Total Out</label>
            <MoneyValue
              amountInWei={to.weiAmount}
              currency={to.currency}
              baseFontSize={1.2}
              containerCss={style.valueWidth}
              fontWeight={700}
            />
          </Box>

          <Box direction="row" justify="between" margin={'2em 0 0 0'}>
            <Button
              type="button"
              onClick={onGoBack}
              size="m"
              color={Color.altGrey}
              disabled={isWorking}
              margin="0 2em 0 0"
              width="5.5em"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={onExchange}
              size="m"
              width="10em"
              icon={ExchangeIcon}
              disabled={isWorking || !feeAmount || !cUsdToCelo}
            >
              Exchange
            </Button>
          </Box>
        </Box>
        <div css={style.rateBox}>
          <label css={style.label}>Rate</label>
          {cUsdToCelo ? (
            <>
              <MoneyValue amountInWei={rate.weiBasis} currency={from.currency} baseFontSize={1.2} />
              <span css={style.valueText}>=</span>
              <MoneyValue amountInWei={rate.weiRate} currency={to.currency} baseFontSize={1.2} />
            </>
          ) : (
            // TODO a proper loader (need to update mocks)
            <span css={style.valueText}>...</span>
          )}
        </div>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  container: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    [mq[768]]: {
      marginTop: '0.5em',
      flexDirection: 'row',
    },
  },
  inputRow: {
    marginBottom: '1.25em',
    [mq[1200]]: {
      marginBottom: '1.6em',
    },
  },
  label: {
    ...Font.inputLabel,
    color: Color.primaryGrey,
  },
  totalLabel: {
    ...Font.inputLabel,
    color: Color.primaryGrey,
    fontWeight: 600,
  },
  labelWidth: {
    width: '9em',
    marginRight: '1em',
    [mq[1200]]: {
      width: '11em',
    },
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
  },
  rateBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0.75em',
    margin: '0.5em 0 1em 0',
    background: Color.fillLighter,
    '& > *': {
      margin: '0 0.5em',
    },
    [mq[768]]: {
      flexDirection: 'column',
      margin: '0 0 0 2em',
      padding: '1em 2.5em',
      '& > *': {
        margin: '0.55em 0',
      },
    },
  },
  rateLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
    marginBottom: '0.5em',
  },
  bottomBorder: {
    paddingBottom: '1.25em',
    borderBottom: `1px solid ${Color.borderMedium}`,
  },
  icon: {
    marginBottom: '-0.3em',
  },
}
