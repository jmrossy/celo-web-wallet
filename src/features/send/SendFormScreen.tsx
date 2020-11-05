import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { SendTokenParams } from 'src/features/send/sendToken';
import { Stylesheet } from 'src/styles/types';
import { useCustomForm } from 'src/utils/useCustomForm';

const initialValues: SendTokenParams = {
  // TODO set to empty string
  recipient: '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55',
  amount: 0,
  currency: Currency.CELO,
  comment: '',
}

type FieldError = {
  error: boolean;
  helpText: string;
}
type ErrorState = {
  [field: string]: FieldError;
}

function validate(values: SendTokenParams): [boolean, ErrorState]{
  let hasErrors = false;
  const errors: ErrorState = {};
  if(!values.amount || isNaN(parseFloat(values.amount.toString())) || values.amount <= 0){
    hasErrors = true;
    errors["amount"] = {error: true, helpText: "Must be greater than 0"};
  }
  if(!values.recipient){
    hasErrors = true;
    errors["recipient"] = {error: true, helpText: "Recipient is required"};
  }
  
  return [hasErrors, errors];
}

export function SendFormScreen() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ErrorState>({});
  // const dispatch = useDispatch()


  const onSubmit = (values: SendTokenParams) => {
    const [hasErrors, fieldErrors] = validate(values);
    if(hasErrors){
      setErrors(fieldErrors);
      return;
    }
    else{
      setErrors({});
      navigate("/send-review", { state: values });
    // dispatch(sendTokenActions.trigger(values))
    }
  }

  const { values, touched, handleChange, handleBlur, handleSubmit } = useCustomForm<SendTokenParams, any>(
    initialValues,
    onSubmit
  )

  useEffect(() => {
    const updated = {...errors};
    for(const propertyName in touched){
      if((touched as any)[propertyName] === true){
        delete updated[propertyName];
      }
    }
    if(!shallowEqual(errors, updated)) setErrors(updated);
  }, [touched]);

  const onRequest = () => {
    const [hasErrors, fieldErrors] = validate(values);
    if(hasErrors){
      setErrors(fieldErrors);
      return;
    }
    else{
      setErrors({});
      navigate("/request-review", { state: values });
    // dispatch(sendTokenActions.trigger(values))
    }
  }
  
  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <form onSubmit={handleSubmit}>
          <h1 css={style.title}>Send or Request Payment</h1>

          <Box direction="column" styles={style.inputRow}>
            <label css={style.inputLabel}>Recipient Address or Phone Number</label>
            <Box direction="row" justify="start">
              {/* <Box direction="column"> */}
                <AddressInput
                  width={346}
                  name="recipient"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.recipient}
                  {...errors["recipient"]}
                />
                {/* {errors["recipient"] && <span css={style.errorLabel}>{errors["recipient"].helpText}</span>} */}
              {/* </Box> */}
              <button css={style.button}>
                <img src={PasteIcon} alt="Copy to Clipbard" css={style.copyIcon}/>
              </button>
              <Identicon address={values.recipient} />
            </Box>
          </Box>

          <Box direction="row" styles={style.inputRow}>
            <Box direction="column" justify="end" align="start" styles={{width: "50%"}}>
              <label css={style.inputLabel}>Amount</label>
              <MoneyValueInput
                width={173}
                name="amount"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.amount.toString()}
                {...errors["amount"]}
              />
              
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
              <Button type="submit" size="m">
                <Box justify="center" align="center">
                  <img src={SendPaymentIcon} css={style.iconLeft} color="white"/>
                  Send Payment
                </Box>
              </Button>
            </Box>
            <Box styles={{width: "48%"}}>
              <Button type="button" size="m" onClick={onRequest}>
                <Box align="center" justify="center">
                  <img src={RequestPaymentIcon} css={style.iconLeft} color="white"/>
                  Request Payment
                </Box>
              </Button>
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
}