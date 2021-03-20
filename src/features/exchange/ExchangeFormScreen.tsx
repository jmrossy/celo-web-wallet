import { ChangeEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import { AmountAndCurrencyInput } from 'src/components/input/AmountAndCurrencyInput'
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
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { CELO, isStableToken, NativeTokenId, NativeTokens } from 'src/tokens'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
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

  const onUseMax = () => {
    const tokenId = values.fromTokenId
    const token = balances.tokens[tokenId]
    const maxAmount = fromWeiRounded(token.value, token, true)
    setValues({ ...values, amount: maxAmount })
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
                tokenValue={values.fromTokenId}
                onTokenSelect={onSelectToken(true)}
                onTokenBlur={handleBlur}
                amountValue={values.amount}
                onAmountChange={handleChange}
                onAmountBlur={handleBlur}
                errors={errors}
                tokenInputName="fromTokenId"
                nativeTokensOnly={true}
              />
            </div>
            <div css={style.inputRow}>
              <label css={style.inputLabel}>To Currency</label>
              <AmountAndCurrencyInput
                tokenValue={values.toTokenId}
                onTokenSelect={onSelectToken(false)}
                onTokenBlur={handleBlur}
                amountValue={toAmount}
                onAmountChange={handleChange}
                onAmountBlur={handleBlur}
                errors={errors}
                tokenInputName="toTokenId"
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
            stableTokenId={stableTokenId}
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
      marginTop: '-0.2em',
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
