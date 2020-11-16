import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import ExchangeIcon from 'src/components/icons/exchange_white.svg'
import { MoneyValueInput } from 'src/components/input/MoneyValueInput'
import { RadioBox } from 'src/components/input/RadioBox'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { exchangeStarted } from 'src/features/exchange/exchangeSlice'
import { ExchangeTokenParams, validate } from 'src/features/exchange/exchangeToken'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { fromWei, toWei, useExchangeValues } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

interface ExchangeTokenForm extends Omit<ExchangeTokenParams, 'amountInWei'> {
  amount: number
}

const initialValues: ExchangeTokenForm = {
  amount: 0,
  fromCurrency: Currency.cUSD,
}

export function ExchangeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const { transaction: tx, toCELORate } = useSelector((state: RootState) => state.exchange)

  const onSubmit = (values: ExchangeTokenForm) => {
    if (areInputsValid()) {
      dispatch(exchangeStarted(toExchangeTokenParams(values)))
      navigate('/exchange-review')
    }
  }

  const { values, touched, handleChange, handleBlur, handleSubmit, resetValues } = useCustomForm<
    ExchangeTokenForm,
    any
  >(toExchangeTokenForm(tx) ?? initialValues, onSubmit)

  const { inputErrors, areInputsValid } = useInputValidation(touched, () =>
    validate(toExchangeTokenParams(values), balances)
  )

  const { to, from, rate } = useExchangeValues(
    values.amount,
    values.fromCurrency,
    toCELORate,
    false
  )

  //-- If the txn gets cleared out in the slice, need to reset it in the screen
  useEffect(() => {
    if (tx === null) {
      resetValues(initialValues)
    }
  }, [tx])

  return (
    <ScreenContentFrame>
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
          <MoneyValue amountInWei={rate.weiBasis} currency={from.currency} baseFontSize={1.2} />
          <span css={style.valueText}>to</span>
          <MoneyValue amountInWei={rate.weiRate} currency={to.currency} baseFontSize={1.2} />
        </Box>

        <Box direction="row" align="center" styles={style.inputRow}>
          <label css={style.inputLabel}>Output Amount</label>
          <MoneyValue amountInWei={to.weiAmount} currency={to.currency} baseFontSize={1.2} />
        </Box>

        <Button type="submit" size="m" icon={ExchangeIcon}>
          Make Exchange
        </Button>
      </form>
    </ScreenContentFrame>
  )
}

function toExchangeTokenParams(values: ExchangeTokenForm): ExchangeTokenParams {
  try {
    return {
      ...values,
      amountInWei: toWei(values.amount).toString(),
    }
  } catch (error) {
    return {
      ...values,
      amountInWei: '0', // TODO Makes this NaN?
    }
  }
}

function toExchangeTokenForm(values: ExchangeTokenParams | null): ExchangeTokenForm | null {
  if (!values) return null
  return {
    ...values,
    amount: fromWei(values.amountInWei),
  }
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
