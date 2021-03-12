import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { NumberInput } from 'src/components/input/NumberInput'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { fetchExchangeRateActions } from 'src/features/exchange/exchangeRate'
import { validate } from 'src/features/exchange/exchangeToken'
import { ExchangeTokenParams } from 'src/features/exchange/types'
import { useExchangeValues } from 'src/features/exchange/utils'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Balances } from 'src/features/wallet/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { NativeTokenId } from 'src/tokens'
import { amountFieldFromWei, amountFieldToWei } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'

interface ExchangeTokenForm extends Omit<ExchangeTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: ExchangeTokenForm = {
  amount: '',
  fromTokenId: NativeTokenId.cUSD,
  toTokenId: NativeTokenId.CELO,
}

export function ExchangeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const { cUsdToCelo } = useSelector((state: RootState) => state.exchange) // TODO get diff rates
  const { transaction: tx } = useSelector((state: RootState) => state.txFlow)
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)

  useEffect(() => {
    dispatch(fetchExchangeRateActions.trigger({}))
  }, [])

  const onSubmit = (values: ExchangeTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Exchange, params: amountFieldToWei(values) }))
    navigate('/exchange-review')
  }

  const validateForm = (values: ExchangeTokenForm) =>
    validate(amountFieldToWei(values), balances, txSizeLimitEnabled)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetValues,
  } = useCustomForm<ExchangeTokenForm>(getInitialValues(tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(tx))
  }, [tx])

  const { to, from, rate } = useExchangeValues(
    values.amount,
    values.fromTokenId,
    values.toTokenId,
    balances,
    cUsdToCelo,
    false
  )

  const selectOptions = useMemo(() => getSelectOptions(balances), [balances])

  return (
    <ScreenContentFrame>
      <h2 css={Font.h2Green}>Make an Exchange</h2>
      <Box styles={style.containerBox}>
        <Box direction="column">
          <form onSubmit={handleSubmit}>
            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>Amount to Exchange</label>
              <NumberInput
                step="0.01"
                name="amount"
                width="7.4em"
                onChange={handleChange}
                value={values.amount}
                onBlur={handleBlur}
                placeholder="1.00"
                {...errors['amount']}
              />
            </Box>
            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>From Currency</label>
              <SelectInput
                name="fromTokenId"
                autoComplete={false}
                width="3em"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.fromTokenId}
                options={selectOptions}
                placeholder="From Currency"
                {...errors['fromTokenId']}
              />
            </Box>

            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>Output Amount</label>
              <MoneyValue amountInWei={to.weiAmount} token={to.token} baseFontSize={1.2} />
            </Box>

            <Button type="submit" size="m">
              Continue
            </Button>
          </form>
        </Box>
        <Box direction="column" styles={style.chartColumn}>
          <Box direction="row" align="center" styles={style.rateRow}>
            <label css={Font.inputLabel}>Current Rate</label>
            {cUsdToCelo ? (
              <>
                <MoneyValue
                  amountInWei={rate.weiBasis}
                  token={from.token}
                  baseFontSize={1.2}
                  margin="0 0 0 1em"
                />
                <span css={style.valueText}>:</span>
                <MoneyValue amountInWei={rate.weiRate} token={to.token} baseFontSize={1.2} />
              </>
            ) : (
              <span css={style.valueText}>Loading...</span>
            )}
          </Box>
          <PriceChartCelo
            showHeaderPrice={false}
            containerCss={style.chartContainer}
            height={200}
          />
        </Box>
      </Box>
    </ScreenContentFrame>
  )
}

function getInitialValues(tx: TxFlowTransaction | null) {
  if (!tx || !tx.params || tx.type !== TxFlowType.Exchange) {
    return initialValues
  } else {
    return amountFieldFromWei(tx.params)
  }
}

function getSelectOptions(balances: Balances) {
  return Object.values(balances.tokens).map((t) => ({
    display: t.label,
    value: t.id,
  }))
}

const style: Stylesheet = {
  containerBox: {
    flexDirection: 'column',
    [mq[1200]]: {
      marginTop: '0.5em',
      flexDirection: 'row',
    },
  },
  inputRow: {
    marginBottom: '2em',
    [mq[1200]]: {
      marginBottom: '3em',
    },
  },
  inputLabel: {
    ...Font.inputLabel,
    width: '10em',
    marginRight: '1em',
  },
  valueText: {
    fontSize: '1.1em',
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: '0 0.5em',
  },
  chartColumn: {
    marginTop: '3em',
    marginLeft: 0,
    width: '100%',
    [mq[1200]]: {
      marginLeft: '8em',
      marginTop: 0,
      width: 'calc(100% - 150px - 10em)',
      maxWidth: '30em',
    },
  },
  rateRow: {
    backgroundColor: Color.fillLighter,
    padding: '0.5em 1em',
    marginBottom: '0.5em',
    marginRight: '1.5em',
  },
  chartContainer: {
    minWidth: 300,
  },
}
