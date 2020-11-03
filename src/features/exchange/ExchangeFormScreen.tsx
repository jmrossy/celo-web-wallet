import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/Button';
import ExchangeIcon from 'src/components/icons/exchange_white.svg';
import { MoneyValueInput } from 'src/components/input/MoneyValueInput';
import { RadioBox } from 'src/components/input/RadioBox';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { Currency } from 'src/consts';
import { ExchangeTokenParams } from 'src/features/exchange/exchangeToken';
import { Color } from 'src/styles/Color';
import { Stylesheet } from 'src/styles/types';
import { useCustomForm } from 'src/utils/useCustomForm';

const initialValues: ExchangeTokenParams = {
  amount: 0,
  fromCurrency: Currency.cUSD,
}

export function ExchangeFormScreen() {
  // const dispatch = useDispatch()
  const navigate = useNavigate();

  const onSubmit = (values: ExchangeTokenParams) => {
    // dispatch(exchangeTokenActions.trigger(values))
    navigate("/exchange-review", {state: values});
  }

  const { values, handleChange, handleSubmit } = useCustomForm<ExchangeTokenParams, any>(
    initialValues,
    onSubmit
  )

  //TODO: get / calculate the exchange rate
  const exchangeRate = useMemo(() => (1/10.24), []);
  const exchangeLabel = useMemo(() => { return values.fromCurrency === Currency.cUSD ? `1 cUSD to ${exchangeRate.toFixed(3)} CELO` : `1 CELO to ${(1/exchangeRate).toFixed(2)} cUSD`}, [values.fromCurrency, exchangeRate]);
  
  const exchangeResult = useMemo(() => {
    const amount = (values.fromCurrency === Currency.CELO) ? values.amount / exchangeRate : values.amount * exchangeRate;
    return amount;
    }, [values.amount, values.fromCurrency, exchangeRate]);

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <form onSubmit={handleSubmit}>
          <h1 css={style.title}>Make an Exchange</h1>

          <Box direction="row" align="center" styles={style.inputRow}>
            <Box styles={style.labelCol}>
              <label css={style.inputLabel}>Amount to Exchange</label>
            </Box>
            <Box styles={style.valueCol}>
              <MoneyValueInput
                name="amount"
                width={150}
                onChange={handleChange}
                value={values.amount.toString()}
              />
            </Box>
          </Box>
          <Box direction="row" align="center" styles={style.inputRow}>
            <Box styles={style.labelCol}>
              <label>Currency</label>
            </Box>
            <Box styles={style.valueCol}>
              <Box direction="row" justify="start" align="start" styles={style.radioBox}>
                <RadioBox tabIndex={0} label="cUSD" value={Currency.cUSD} name="fromCurrency" checked={values.fromCurrency === Currency.cUSD} onChange={handleChange} classes={{container: {minWidth: 52}}} />
                <RadioBox tabIndex={1} label="CELO" value={Currency.CELO} name="fromCurrency" checked={values.fromCurrency === Currency.CELO} onChange={handleChange} classes={{container: {minWidth: 52}}} />
              </Box>
            </Box>  
          </Box>
          <Box direction="row" align="center" styles={style.inputRow}>
            <Box styles={style.labelCol}>
              <label>Current Rate</label>
            </Box>
            <Box styles={style.valueCol}>
              <span css={style.valueText}>{exchangeLabel}</span>
            </Box>
          </Box>

          <Box direction="row" align="center" styles={style.inputRow}>
            <Box styles={style.labelCol}>
              <label>Output Amount</label>
            </Box>
            <Box styles={style.valueCol}>
              <span css={style.outputText}>
                {exchangeResult.toLocaleString()}
                {values.fromCurrency === Currency.cUSD && <span css={style.celoLabel}>CELO</span>}
                {values.fromCurrency === Currency.CELO && <span css={style.cusdLabel}>cUSD</span>}
              </span>
            </Box>
          </Box>

          <Button type="submit" size="m">
            <Box justify="center" align="center">
              <img src={ExchangeIcon} css={style.iconLeft} color="white"/>
              Make Exchange
            </Box>
          </Button>

        </form>
      </Box>
    </ScreenFrameWithFeed>
  )
}

const style: Stylesheet = {
  contentContainer: {
    height: "100%",
    paddingLeft: 65,
    paddingTop: 30,
    maxWidth: 500,
    width: "100%",
  },
  title: {
    color: "#3488EC",
    fontWeight: 400,
    fontSize: 30,
    marginTop: 0,
    marginBottom: 20,
  },
  inputRow: {
    height: 48, 
    marginBottom: 30,
  },
  labelCol: {
    width: 175,
  },
  valueCol: {
    width: 'calc(100% - 175px)',
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: 18,
    marginBottom: 8,
  },
  button: {
    marginLeft: 8,
    marginRight: 8,
    background: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    "&:focus": {
      outline: "none",
    }
  },
  valueText: {
    fontSize: 20,
    fontWeight: 400,
    color: Color.primaryGrey,
  },
  outputText: {
    fontSize: 20,
    fontWeight: 400,
    color: Color.primaryBlack,
  },
  celoLabel: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: 500,
    color: Color.primaryGold,
  },
  cusdLabel: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: 400,
    color: Color.primaryGreen,
  }
}