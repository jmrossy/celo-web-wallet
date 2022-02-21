import { ChangeEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import { AmountAndCurrencyInput } from 'src/components/input/AmountAndCurrencyInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { useBalances } from 'src/features/balances/hooks'
import { getTokenBalance } from 'src/features/balances/utils'
import { fetchExchangeRateActions } from 'src/features/exchange/exchangeRate'
import { validate } from 'src/features/exchange/exchangeToken'
import { ExchangeTokenParams } from 'src/features/exchange/types'
import { useExchangeValues } from 'src/features/exchange/utils'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { useTokens } from 'src/features/tokens/hooks'
import { isStableTokenAddress } from 'src/features/tokens/utils'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { CELO, cUSD } from 'src/tokens'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'

interface ExchangeTokenForm extends Omit<ExchangeTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: ExchangeTokenForm = {
  amount: '',
  fromTokenAddress: cUSD.address,
  toTokenAddress: CELO.address,
}

export function ExchangeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useBalances()
  const tokens = useTokens()
  const tx = useFlowTransaction()
  const toCeloRates = useSelector((state: RootState) => state.exchange.toCeloRates)
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)

  useEffect(() => {
    dispatch(fetchExchangeRateActions.trigger({ force: false }))
  }, [])

  const onSubmit = (values: ExchangeTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Exchange, params: amountFieldToWei(values) }))
    navigate('/exchange-review')
  }

  const validateForm = (values: ExchangeTokenForm) =>
    validate(amountFieldToWei(values), balances, tokens, txSizeLimitEnabled)

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
    const targetField = isFromToken ? 'fromTokenAddress' : 'toTokenAddress'
    const otherField = isFromToken ? 'toTokenAddress' : 'fromTokenAddress'
    if (isStableTokenAddress(value)) {
      setValues({ ...values, [name]: value, [otherField]: CELO.address })
    } else {
      const newTokenAddress = isStableTokenAddress(values[targetField])
        ? values[targetField]
        : cUSD.address
      setValues({ ...values, [name]: value, [otherField]: newTokenAddress })
    }
    resetErrors()
  }

  const onUseMax = () => {
    const tokenAddress = values.fromTokenAddress
    const token = tokens[tokenAddress]
    const balance = getTokenBalance(balances, token)
    const maxAmount = fromWeiRounded(balance, token, true)
    setValues({ ...values, amount: maxAmount })
    resetErrors()
  }

  const { to, rate } = useExchangeValues(
    values.amount,
    values.fromTokenAddress,
    values.toTokenAddress,
    tokens,
    toCeloRates,
    false
  )
  const stableTokenAddress =
    values.fromTokenAddress === CELO.address ? values.toTokenAddress : values.fromTokenAddress
  const stableToken = tokens[stableTokenAddress]
  const toAmount = fromWeiRounded(to.weiAmount, to.token, true)

  return (
    <ScreenContentFrame>
      <h2 css={Font.h2Green}>Make an Exchange</h2>
      <Box styles={style.containerBox}>
        <Box direction="column">
          <form onSubmit={handleSubmit}>
            <div css={style.inputRow}>
              <Box direction="row" justify="between" align="start">
                <label css={style.inputLabel}>From Currency</label>
                <TextButton onClick={onUseMax} styles={style.maxAmountButton}>
                  Use Max
                </TextButton>
              </Box>
              <AmountAndCurrencyInput
                tokenValue={values.fromTokenAddress}
                onTokenSelect={onSelectToken(true)}
                onTokenBlur={handleBlur}
                amountValue={values.amount}
                onAmountChange={handleChange}
                onAmountBlur={handleBlur}
                errors={errors}
                tokenInputName="fromTokenAddress"
                nativeTokensOnly={true}
              />
            </div>
            <div css={style.inputRow}>
              <label css={style.inputLabel}>To Currency</label>
              <AmountAndCurrencyInput
                tokenValue={values.toTokenAddress}
                onTokenSelect={onSelectToken(false)}
                onTokenBlur={handleBlur}
                amountValue={toAmount}
                amountName="toAmount"
                onAmountChange={handleChange}
                onAmountBlur={handleBlur}
                errors={errors}
                tokenInputName="toTokenAddress"
                inputDisabled={true}
                nativeTokensOnly={true}
              />
            </div>

            <Button type="submit" size="m">
              Continue
            </Button>
          </form>
        </Box>
        <Box direction="column" styles={style.chartColumn}>
          <Box direction="row" align="center" justify="center" styles={style.rateRow}>
            <label css={Font.inputLabel}>Current Rate</label>
            {rate.isReady ? (
              <>
                <MoneyValue
                  amountInWei={rate.fromCeloWeiValue}
                  token={stableToken}
                  baseFontSize={1.2}
                  margin="0 0 0 1em"
                  containerCss={style.rateValue}
                />
                <span css={style.valueText}>:</span>
                <MoneyValue
                  amountInWei={rate.weiBasis}
                  token={CELO}
                  baseFontSize={1.2}
                  containerCss={style.rateValue}
                />
              </>
            ) : (
              <span css={style.valueText}>Loading...</span>
            )}
          </Box>
          <PriceChartCelo
            quoteTokenAddress={stableTokenAddress}
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

const style: Stylesheet = {
  containerBox: {
    flexDirection: 'column',
    [mq[1200]]: {
      marginTop: '0.5em',
      flexDirection: 'row',
    },
  },
  inputRow: {
    maxWidth: '26em',
    marginBottom: '1.5em',
    [mq[1200]]: {
      marginBottom: '3em',
    },
  },
  inputLabel: {
    ...Font.inputLabel,
    display: 'block',
    marginBottom: '0.75em',
  },
  valueText: {
    fontSize: '1.1em',
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: '0 0.5em',
  },
  maxAmountButton: {
    fontWeight: 400,
    fontSize: '0.9em',
  },
  chartColumn: {
    marginTop: '3em',
    marginLeft: 0,
    width: '100%',
    [mq[1200]]: {
      marginLeft: '6em',
      marginTop: '-0.3em',
      width: 'calc(100% - 150px - 10em)',
      maxWidth: '30em',
    },
  },
  rateRow: {
    backgroundColor: Color.fillLighter,
    padding: '0.5em 1em',
    marginBottom: '0.2em',
    marginRight: '1.5em',
    borderRadius: 6,
  },
  rateValue: {
    paddingBottom: 3,
  },
  chartContainer: {
    minWidth: 300,
  },
}
