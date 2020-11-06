import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'src/components/Button';
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg';
import ExchangeIcon from 'src/components/icons/exchange_white.svg';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { MoneyValue } from 'src/components/MoneyValue';
import { Currency } from 'src/consts';
import { ExchangeTokenParams } from 'src/features/exchange/exchangeToken';
import { Color } from 'src/styles/Color';
import { Stylesheet } from 'src/styles/types';
import { formatAmount } from 'src/utils/amount';

// function currencyLabel(curr: Currency){
//   return curr === Currency.CELO ? "CELO" : "cUSD";
// }

// function currencyColor(curr: Currency){
//   return curr === Currency.CELO ? 
// }


export function ExchangeConfirmationScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ExchangeTokenParams);

  //TODO: get / calculate the exchange rate
  const exchangeRate = useMemo(() => (1/10.24), []);
  const exchangeLabel = useMemo(() => { return state.fromCurrency === Currency.cUSD ? `1 cUSD to ${exchangeRate.toFixed(3)} CELO` : `1 CELO to ${(1/exchangeRate).toFixed(2)} cUSD`}, [state.fromCurrency, exchangeRate]);
  //TODO: why does the total need to be a full number for the MoneyValue to work?
  const total = useMemo(() => { return parseInt(formatAmount(parseFloat(state.amount.toString()) * exchangeRate)); }, [exchangeRate, state.amount]);
  const toCurrency = useMemo(() => { return state.fromCurrency === Currency.CELO ? Currency.cUSD : Currency.CELO; }, [state.fromCurrency]);

  // const { symbol: fromSymbol, color: fromColor } = useMemo(() => { return getCurrencyProps(state.fromCurrency); }, [state.fromCurrency]);
  // const { symbol: toSymbol, color: toColor } = useMemo(() => { return getCurrencyProps(toCurrency); }, [toCurrency]);

  function onGoBack(){
    navigate(-1);
  }

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <h1 css={style.title}>Review Exchange</h1>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Amount</label>
          <Box direction="row" align="end">
            <MoneyValue amountInWei={state.amount} currency={state.fromCurrency} baseFontSize={1.2}/>
          </Box>
        </Box>

        <Box direction="row" align="center" styles={style.inputRow}>
          <Box styles={style.labelCol}>
            <label css={style.inputLabel}>Current Rate</label>
          </Box>
          <Box styles={style.valueCol}>
            <span css={style.rateText}>{exchangeLabel}</span>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={{...style.inputLabel, fontWeight: "bolder"}}>Total</label>
          <Box direction="row" align="end">
            <MoneyValue amountInWei={total} currency={toCurrency} baseFontSize={1.2}/>
          </Box>
        </Box>

        <Box direction="row" justify="between">
          <Box styles={{width: "48%"}}>
            <Button type="button" size="m" color={Color.primaryGrey} onClick={onGoBack}>
              <Box justify="center" align="center">
                <img src={ArrowBackIcon} css={style.iconLeft}/>
                Edit Exchange
              </Box>
            </Button>
          </Box>
          <Box styles={{width: "48%"}}>
            <Button type="submit" size="m">
              <Box align="center" justify="center">
                <img src={ExchangeIcon} css={style.iconLeft}/>
                Make Exchange
              </Box>
            </Button>
          </Box>
        </Box>

      </Box>
    </ScreenFrameWithFeed>
  );
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
    marginBottom: 30,
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: 18,
    // marginBottom: 8,
    width: 150,
    minWidth: 150,
  },
  currencyLabel: {
    marginRight: 4,
    color: Color.primaryGreen,
    fontSize: 16,
    fontWeight: 400,
  },
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: 20,
    fontWeight: 400,
  },
  rateText: {
    fontSize: 20,
    fontWeight: 400,
    color: Color.primaryGrey,
  },
  recipientLabel: {
    color: Color.accentBlue,
    marginLeft: -8,
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
  copyIcon: {
    height: 14,
    width: 18,
  },
  radioBox: {
    height: "100%", 
    width: "100%",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  }
}