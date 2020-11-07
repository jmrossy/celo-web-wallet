import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from 'src/app/rootReducer';
import { Button } from 'src/components/Button';
import PasteIcon from 'src/components/icons/paste.svg';
import RequestPaymentIcon from 'src/components/icons/request_payment_white.svg';
import SendPaymentIcon from 'src/components/icons/send_payment_white.svg';
import { Identicon } from 'src/components/Identicon';
import { AddressInput } from 'src/components/input/AddressInput';
import { MoneyValueInput } from 'src/components/input/MoneyValueInput';
import { RadioBox } from 'src/components/input/RadioBox';
import { TextArea } from 'src/components/input/TextArea';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { Currency } from 'src/consts';
import { cancelTransaction, changeStatus, clearError } from 'src/features/send/sendSlice';
import { sendTokenActions } from 'src/features/send/sendToken';
import { SendTokenParams } from 'src/features/send/types';
import { Color } from 'src/styles/Color';
import { Stylesheet } from 'src/styles/types';
import { useCustomForm } from 'src/utils/useCustomForm';

const initialValues: SendTokenParams = {
  // TODO set to empty string
  recipient: '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55',
  amount: 0,
  currency: Currency.CELO,
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errCount, setErrCount] = useState<number>(0);
  const {transaction, status, errors } = useSelector((state: RootState) => state.send);

  useEffect(() => {
    if(status === "needs-confirm"){
      dispatch(changeStatus("confirming"));
      navigate("/send-review");
    }
    else if(status === "confirming"){
      //they must have navigated back to here
      dispatch(cancelTransaction());
    }
  }, [status]);

  const onSubmit = async (values: SendTokenParams) => {
    await dispatch(sendTokenActions.trigger(values));
  }

  const { values, touched, handleChange, handleBlur, handleSubmit } = useCustomForm<SendTokenParams, any>(
    transaction ?? initialValues,
    onSubmit
  )

  const onRequest = () => {
    // const [hasErrors, fieldErrors] = validate(values);
    // if(hasErrors){
    //   setErrors(fieldErrors);
    //   return;
    // }
    // else{
    //   setErrors({});
    //   const requestValues = {...values, isRequest: true};
    //   navigate("/send-review", { state: requestValues });
    // // dispatch(sendTokenActions.trigger(values))
    // }
  }

  const onCopyAddress = async () => {
    await navigator.clipboard.writeText(values.recipient);
  }

  // Watch the touched fields, and clear any errors that need clearing
  useEffect(() => {
    if(!errors || Object.keys(errors).length === 0) return;

    const fields = Object.keys(touched).reduce((output: string[], key: string) => {
      return (touched as any)[key] === true ? [...output, key] : output;
    }, []);

    if(fields.length > 0 && fields.length !== errCount){
      dispatch(clearError(fields));
      setErrCount(fields.length);
    }
    else setErrCount(0);
    
  }, [touched]);

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <form onSubmit={handleSubmit}>
          <h1 css={style.title}>Send or Request Payment</h1>

          <Box direction="column" styles={style.inputRow}>
            <label css={style.inputLabel}>Recipient Address or Phone Number</label>

            <Box direction="row" justify="start" align="end">
              <AddressInput width={346} name="recipient" onChange={handleChange} onBlur={handleBlur} value={values.recipient} {...errors["recipient"]} />
              <Button size="icon" type="button" color={Color.fillLight} margin="0 8px" onClick={onCopyAddress}>
                <img src={PasteIcon} alt="Copy to Clipbard" css={style.copyIcon}/>
              </Button>
              <Identicon address={values.recipient} />
            </Box>
          </Box>

          <Box direction="row" styles={style.inputRow}>
            <Box direction="column" justify="end" align="start">
              <label css={style.inputLabel}>Amount</label>
              <MoneyValueInput width={173} name="amount" onChange={handleChange} onBlur={handleBlur} value={values.amount.toString()} {...errors["amount"]} />
            </Box>
            <Box direction="column" align="start" styles={{width: "50%"}}>
              <label css={style.inputLabel}>Currency</label>
              <Box direction="row" justify="start" align="end" styles={style.radioBox}>
                <RadioBox tabIndex={0} label="cUSD" value={Currency.cUSD} name="currency" checked={values.currency === Currency.cUSD} onChange={handleChange} classes={{container: {minWidth: 52}}} />
                <RadioBox tabIndex={1} label="CELO" value={Currency.CELO} name="currency" checked={values.currency === Currency.CELO} onChange={handleChange} classes={{container: {minWidth: 52}}} />
              </Box>
            </Box>
          </Box>

          <Box direction="column" align="start" styles={style.inputRow}>
            <label css={style.inputLabel}>Comment (optional)</label>
            <TextArea name="comment" width={346} rows={8} height={80} onChange={handleChange} onBlur={handleBlur} value={values.comment} />
          </Box>

          <Box direction="row" justify="between">
            <Box styles={{width: "48%"}}>
              <Button type="submit" size="m" icon={SendPaymentIcon}>Send Payment</Button>
            </Box>
            <Box styles={{width: "48%"}}>
              <Button type="button" size="m" onClick={onRequest} icon={RequestPaymentIcon}>Request Payment</Button>
            </Box>
          </Box>
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
    marginBottom: 30,
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: 18,
    marginBottom: 8,
  },
  copyIcon: {
    height: 14,
    width: 18,
  },
  radioBox: {
    height: "100%", 
    width: "100%",
    marginLeft: 8,
  },
}