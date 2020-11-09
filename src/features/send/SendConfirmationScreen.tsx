import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from 'src/app/rootReducer';
import { Address } from 'src/components/Address';
import { Button } from 'src/components/Button';
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg';
import QuestionIcon from 'src/components/icons/question_mark.svg';
import RequestPaymentIcon from 'src/components/icons/request_payment_white.svg';
import SendPaymentIcon from 'src/components/icons/send_payment_white.svg';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { MoneyValue } from 'src/components/MoneyValue';
import { sendTransaction } from 'src/features/send/sendSlice';
import { Color } from 'src/styles/Color';
import { Stylesheet } from 'src/styles/types';
import { useWeiTransaction } from 'src/utils/amount';

export function SendConfirmationScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transaction: txn, status } = useSelector((state: RootState) => state.send);
  const isRequest = useMemo(() => { return false; }, [txn]);
  const { wei } = useWeiTransaction(txn?.amount ?? 0, 0.02);

  //TODO: Wrap the following two lines into a hook to simplify getting the working state as a bool?
  const { progress, error } = useSelector((state: RootState) => state.saga.sendToken);
  const isWorking = useMemo(() => { return progress === "started"; }, [progress, error]);
  
  //-- need to make sure we belong on this screen
  useEffect(() => {
    if(status !== "confirming" && status !== "confirmed"){  //shouldn't be on the confirm screen
      navigate("/send");
    }
    else if(progress && progress !== "started"){  //the send request is no longer in progress
      navigate("/send");
    }
  }, [status, progress]);

  
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
            <MoneyValue amountInWei={wei.amount} currency={txn.currency} baseFontSize={1.2}/>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Security Fee</label>
          <Box direction="row" align="end">
            <MoneyValue amountInWei={wei.fee} currency={txn.currency} baseFontSize={1.2}/>
            <img src={QuestionIcon} css={style.iconRight}/>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={{...style.inputLabel, fontWeight: "bolder"}}>Total</label>
          <Box direction="row" align="end">
            <MoneyValue amountInWei={wei.total} currency={txn.currency} baseFontSize={1.2} classes={{amount: {fontWeight: "bolder"}}}/>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Recipient</label>
          <Box direction="row" align="center">
            <Address address={txn.recipient} />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={style.inputLabel}>Comment</label>
          <label css={style.valueLabel}>{txn.comment}</label>
        </Box>

        <Box direction="row" justify="between">
          <Button type="button" size="m" color={Color.primaryGrey} css={{width: "48%"}} onClick={onGoBack} icon={ArrowBackIcon} disabled={isWorking}>
            Edit {isRequest ? "Request" : "Payment"}
          </Button>
          <Button type="submit" size="m" css={{width: "48%"}} onClick={onSend} icon={isRequest ? RequestPaymentIcon : SendPaymentIcon} disabled={isWorking}>
            Send {isRequest ? "Request" : "Payment"}  
          </Button>
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
    width: 150,
    minWidth: 150,
  },
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: 20,
    fontWeight: 400,
  },  
  iconRight: {
    marginLeft: 8,
  }
}