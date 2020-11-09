import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from 'src/app/rootReducer';
import { Button } from 'src/components/Button';
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg';
import ExchangeIcon from 'src/components/icons/exchange_white.svg';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { MoneyValue } from 'src/components/MoneyValue';
import { Currency } from 'src/consts';
import { sendExchange } from 'src/features/exchange/exchangeSlice';
import { ExchangeTokenParams } from 'src/features/exchange/types';
import { Color } from 'src/styles/Color';
import { Stylesheet } from 'src/styles/types';
import { useWeiExchange } from 'src/utils/amount';

const emptyTransaction: ExchangeTokenParams = {
  amount: 0,
  fromCurrency: Currency.cUSD,
}

export function ExchangeConfirmationScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transaction: txn, status, toCELORate, isExchanging } = useSelector((state: RootState) => state.exchange);

  const safeTxn = useMemo<ExchangeTokenParams>(() => { return txn ?? emptyTransaction }, [txn]);  //to avoid having to qualify every reference to txn
  const rate = useMemo(() => { return safeTxn.fromCurrency === Currency.cUSD ? toCELORate : (1 / toCELORate); }, [safeTxn.fromCurrency]);
  const exchange = useWeiExchange(safeTxn.amount, safeTxn.fromCurrency, rate, 0);

  //-- need to make sure we belong on this screen
  useEffect(() => {
    if(status !== "confirming" && status !== "confirmed"){  //shouldn't be on the confirm screen
      navigate("/exchange");
    }
  }, [status]);

  function onGoBack(){
    navigate(-1);
  }

  async function onExchange(){
    await dispatch(sendExchange());
  }

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <h1 css={style.title}>Review Exchange</h1>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Amount</label>
          <MoneyValue amountInWei={exchange.from.weiAmount} currency={exchange.from.currency} baseFontSize={1.2}/>
        </Box>

        <Box direction="row" align="center" styles={style.inputRow}>
          <label css={style.inputLabel}>Current Rate</label>
          <MoneyValue amountInWei={exchange.props.weiBasis} currency={exchange.from.currency} baseFontSize={1.2}/>
            <span css={style.valueText}>to</span>
            <MoneyValue amountInWei={exchange.props.weiRate} currency={exchange.to.currency} baseFontSize={1.2}/>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={{...style.inputLabel, fontWeight: "bolder"}}>Total</label>
          <MoneyValue amountInWei={exchange.to.weiAmount} currency={exchange.to.currency} baseFontSize={1.2}/>
        </Box>

        <Box direction="row" justify="between">
          <Button type="button" onClick={onGoBack} size="m" icon={ArrowBackIcon} color={Color.primaryGrey} css={{width: "48%"}} disabled={isExchanging}>Edit Exchange</Button>
          <Button type="button" onClick={onExchange} size="m" css={{width: "48%"}} icon={ExchangeIcon} disabled={isExchanging}>Make Exchange</Button>          
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
  valueText: {
    fontSize: 20,
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: "0 8px",
  },  
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  }
}