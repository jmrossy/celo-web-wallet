import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import ExchangeIcon from 'src/components/icons/exchange_white.svg'
import { MoneyValueInput } from 'src/components/input/MoneyValueInput'
import { RadioBox } from 'src/components/input/RadioBox'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { exchangeStarted } from 'src/features/exchange/exchangeSlice'
import { ExchangeTokenParams, validate } from 'src/features/exchange/exchangeToken'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { useWeiExchange } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues: ExchangeTokenParams = {
  amount: 0,
  fromCurrency: Currency.cUSD,
}

export function ExchangeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const staleBalances = useSelector((state: RootState) => state.wallet.balances)
  const { transaction: txn, toCELORate } = useSelector((state: RootState) => state.exchange)

  const onSubmit = async (values: ExchangeTokenParams) => {
    if (areInputsValid()) {
      const safeValues = { ...values, amount: parseFloat(values.amount.toString()) }
      dispatch(exchangeStarted(safeValues))
      navigate('/exchange-review')
    }
  }

  const { values, touched, handleChange, handleBlur, handleSubmit, resetValues } = useCustomForm<
    ExchangeTokenParams,
    any
  >(txn ?? initialValues, onSubmit)

  const { inputErrors, areInputsValid } = useInputValidation(touched, () =>
    validate(values, staleBalances)
  )

  const fAmount = parseFloat(values.amount.toString())
  const exchangeRate = values.fromCurrency === Currency.cUSD ? toCELORate : 1 / toCELORate
  const exchange = useWeiExchange(
    isNaN(fAmount) ? 0 : fAmount,
    values.fromCurrency,
    exchangeRate,
    0
  )

  //-- If the txn gets cleared out in the slice, need to reset it in the screen
  useEffect(() => {
    if (txn === null) {
      resetValues(initialValues)
    }
  }, [txn])

  return (
    <Box direction="column" styles={style.contentContainer}>
      <form onSubmit={handleSubmit}>
        <h1 css={style.title}>Make an Exchange</h1>

        <Box direction="row" align="center" styles={style.inputRow}>
          <label css={style.inputLabel}>Amount to Exchange</label>
          <MoneyValueInput
            name="amount"
            width={150}
            onChange={handleChange}
            value={values.amount.toString()}
            onBlur={handleBlur}
            {...inputErrors['amount']}
          />
        </Box>
        <Box direction="row" align="center" styles={style.inputRow}>
          <label css={style.inputLabel}>Currency</label>
          <RadioBox
            tabIndex={0}
            label="cUSD"
            value={Currency.cUSD}
            name="fromCurrency"
            checked={values.fromCurrency === Currency.cUSD}
            onChange={handleChange}
            containerCss={{ minWidth: 52 }}
          />
          <RadioBox
            tabIndex={1}
            label="CELO"
            value={Currency.CELO}
            name="fromCurrency"
            checked={values.fromCurrency === Currency.CELO}
            onChange={handleChange}
            containerCss={{ minWidth: 52 }}
          />
        </Box>
        <Box direction="row" align="center" styles={style.inputRow}>
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

        <Box direction="row" align="center" styles={style.inputRow}>
          <label css={style.inputLabel}>Output Amount</label>
          <MoneyValue
            amountInWei={exchange.to.weiAmount}
            currency={exchange.to.currency}
            baseFontSize={1.2}
          />
        </Box>

        <Button type="submit" size="m" icon={ExchangeIcon}>
          Make Exchange
        </Button>
      </form>
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
    width: '9em',
    marginRight: '1em',
  },
  valueText: {
    fontSize: '1.1em',
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: '0 0.5em',
  },
}
