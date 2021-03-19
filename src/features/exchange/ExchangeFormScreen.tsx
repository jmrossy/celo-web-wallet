import { ChangeEvent, useEffect, useMemo } from 'react'
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
import { CELO, isStableToken, NativeTokenId, NativeTokens } from 'src/tokens'
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
  const toCeloRates = useSelector((state: RootState) => state.exchange.toCeloRates)
  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)

  useEffect(() => {
    dispatch(fetchExchangeRateActions.trigger({ force: false }))
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
    setValues,
    resetErrors,
  } = useCustomForm<ExchangeTokenForm>(getInitialValues(tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(tx))
  }, [tx])

  const onSelectToken = (isFromToken: boolean) => (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const targetField = isFromToken ? 'fromTokenId' : 'toTokenId'
    const otherField = isFromToken ? 'toTokenId' : 'fromTokenId'
    if (isStableToken(value)) {
      setValues({ ...values, [name]: value, [otherField]: NativeTokenId.CELO })
    } else {
      const newTokenId = isStableToken(values[targetField])
        ? values[targetField]
        : NativeTokenId.cUSD
      setValues({ ...values, [name]: value, [otherField]: newTokenId })
    }
    resetErrors()
  }

  const { to, rate } = useExchangeValues(
    values.amount,
    values.fromTokenId,
    values.toTokenId,
    balances,
    toCeloRates,
    false
  )
  const stableTokenId = values.fromTokenId === CELO.id ? values.toTokenId : values.fromTokenId
  const stableToken = NativeTokens[stableTokenId]

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
                width="8em"
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
                width="8em"
                onChange={onSelectToken(true)}
                onBlur={handleBlur}
                value={values.fromTokenId}
                options={selectOptions}
                placeholder="From Currency"
                {...errors['fromTokenId']}
              />
            </Box>
            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>To Currency</label>
              <SelectInput
                name="toTokenId"
                autoComplete={false}
                width="8em"
                onChange={onSelectToken(false)}
                onBlur={handleBlur}
                value={values.toTokenId}
                options={selectOptions}
                placeholder="To Currency"
                {...errors['toTokenId']}
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
            {rate.isReady ? (
              <>
                <MoneyValue
                  amountInWei={rate.fromCeloWeiValue}
                  token={stableToken}
                  baseFontSize={1.2}
                  margin="0 0 0 1em"
                />
                <span css={style.valueText}>:</span>
                <MoneyValue amountInWei={rate.weiBasis} token={CELO} baseFontSize={1.2} />
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
    marginBottom: '1em',
    [mq[1200]]: {
      marginBottom: '1.5em',
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
