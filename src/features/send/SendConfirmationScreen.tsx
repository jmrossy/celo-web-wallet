import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from 'src/app/rootReducer';
import { Button } from 'src/components/Button';
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg';
import Curve from 'src/components/icons/curve.svg';
import PlusIcon from 'src/components/icons/plus_white.svg';
import QuestionIcon from 'src/components/icons/question_mark.svg';
import RequestPaymentIcon from 'src/components/icons/request_payment_white.svg';
import SendPaymentIcon from 'src/components/icons/send_payment_white.svg';
import { Identicon } from 'src/components/Identicon';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { Currency } from 'src/consts';
import { sendTransaction } from 'src/features/send/sendSlice';
import { Color } from 'src/styles/Color';
import { Stylesheet } from 'src/styles/types';
import { formatAmount } from 'src/utils/amount';

function currencyLabel(curr: Currency){
  return curr === Currency.CELO ? "CELO" : "cUSD";
}

export function SendConfirmationScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transaction: txn, status } = useSelector((state: RootState) => state.send);
  const isRequest = useMemo(() => { return false; }, [txn]); //(location.state as any).isRequest === true; }, [state]);
  const [fee] = useState(0.02);
  const total = useMemo(() => { return txn ? parseFloat(txn?.amount.toString()) + fee : 0; }, [fee, txn?.amount]);

  useEffect(() => {
    if(status !== "confirming"){  //shouldn't be on the confirm screen
      navigate("/send");
    }
  }, [status]);

  function onGoBack(){
    navigate(-1);
  }

  async function onSend(){
    await dispatch(sendTransaction());
  }

  if(!txn) return null;
  
  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <h1 css={style.title}>Review {isRequest ? "Request" : "Payment"}</h1>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Amount</label>
          <Box direction="row" align="end">
            <label css={style.currencyLabel}>{currencyLabel(txn.currency)}</label>
            <label css={style.valueLabel}>{formatAmount(txn.amount)}</label>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Security Fee</label>
          <Box direction="row" align="end">
            <label css={style.currencyLabel}>{currencyLabel(txn.currency)}</label>
            <label css={style.valueLabel}>{formatAmount(fee)}</label>
            <img src={QuestionIcon} css={style.iconRight}/>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={{...style.inputLabel, fontWeight: "bolder"}}>Total</label>
          <Box direction="row" align="end">
            <label css={style.currencyLabel}>{currencyLabel(txn.currency)}</label>
            <label css={{...style.valueLabel, fontWeight: "bolder"}}>{formatAmount(total)}</label>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Recipient</label>
          <Box direction="row" align="center">
            <Identicon address={txn.recipient}/>
            <img src={Curve} css={{marginLeft: -4, marginTop: -4}}/>
            <Box direction="row" align="center" styles={{marginLeft: -8, marginTop: -4, backgroundColor: Color.fillLight, height: 34}}>
              <label css={style.recipientLabel}>{txn.recipient}</label>
              <Button type="button" size="icon" margin={"0 -8px 0 8px"}>
                <img src={PlusIcon} height={18} width={18}/>
              </Button>
            </Box>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Comment</label>
          <label css={style.valueLabel}>{txn.comment}</label>
        </Box>

        <Box direction="row" justify="between">
          <Box styles={{width: "48%"}}>
            <Button type="button" size="m" color={Color.primaryGrey} onClick={onGoBack}>
              <Box justify="center" align="center">
                <img src={ArrowBackIcon} css={style.iconLeft} color="white"/>
                Edit {isRequest ? "Request" : "Payment"}
              </Box>
            </Button>
          </Box>
          <Box styles={{width: "48%"}}>
            <Button type="submit" size="m" onClick={onSend}>
              <Box align="center" justify="center">
                <img src={isRequest ? RequestPaymentIcon : SendPaymentIcon} css={style.iconLeft} color="white"/>
                Send {isRequest ? "Request" : "Payment"}
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