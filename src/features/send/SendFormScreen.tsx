import { useDispatch } from 'react-redux';
import { Button } from 'src/components/Button';
// import CopyIcon from 'src/components/icons/copy.svg'
import PasteIcon from 'src/components/icons/paste.svg';
// import CopyIcon from 'src/components/icons/copyToClipbard.svg'
import { Identicon } from 'src/components/Identicon';
import { AddressInput } from 'src/components/input/AddressInput';
import { MoneyValueInput } from 'src/components/input/MoneyValueInput';
import { TextArea } from 'src/components/input/TextArea';
import { Box } from 'src/components/layout/Box';
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed';
import { Currency } from 'src/consts';
import { sendTokenActions, SendTokenParams } from 'src/features/send/sendToken';
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
  const dispatch = useDispatch()


  const onSubmit = (values: SendTokenParams) => {
    dispatch(sendTokenActions.trigger(values))
  }

  const { values, handleChange, handleSubmit } = useCustomForm<SendTokenParams, any>(
    initialValues,
    onSubmit
  )

  // function onRadioChanged(e: ChangeEvent<HTMLElement>){
    
  // }

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <form onSubmit={handleSubmit}>
          <h1 css={style.title}>Send or Request Payment</h1>

          <Box direction="column" styles={style.inputRow}>
            <label css={style.inputLabel}>Recipient Address or Phone Number</label>
            <Box direction="row" justify="start">
              <AddressInput
                width={346}
                name="recipient"
                onChange={handleChange}
                value={values.recipient}
              />
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
                value={values.amount.toString()}
              />
            </Box>
            <Box direction="column" align="start" styles={{width: "50%"}}>
              <label css={style.inputLabel}>Currency</label>
              <Box direction="row" justify="start" align="end" styles={style.radioBox}>
                <label css={values.currency === Currency.cUSD ? style.radioSelectedLabel : style.radioLabel}>
                  <input type="radio" value={Currency.cUSD} name="currency" css={style.radioInput} checked={values.currency === Currency.cUSD} onChange={handleChange}/>
                  <span css={style.radioSpan}>cUSD</span>
                </label>
                <label css={values.currency === Currency.CELO ? style.radioSelectedLabel : style.radioLabel}>
                  <input type="radio" value={Currency.CELO} name="currency" css={style.radioInput} checked={values.currency === Currency.CELO} onChange={handleChange}/>
                  <span css={style.radioSpan}>CELO</span>
                </label>
              </Box>
            </Box>
          </Box>

          <Box direction="column" align="start" styles={style.inputRow}>
            <label css={style.inputLabel}>Comment (optional)</label>
            <TextArea name="comment" width={346} rows={8} height={80} onChange={handleChange} value={values.comment} />
          </Box>

          <Box direction="row" justify="between">
            <Box styles={{width: "48%"}}>
              <Button type="submit" size="m">Send Payment</Button>
            </Box>
            <Box styles={{width: "48%"}}>
              <Button type="button" size="m">Request Payment</Button>
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
    marginBottom: 14,
  },
  inputRow: {
    marginBottom: 33,
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: 18,
    marginBottom: 14,
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
  radioLabel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 14px",
    border: "1px solid #9CA4A9",
    cursor: "pointer",
    userSelect: "none",
    color: "#9CA4A9",
    height: 40,
    marginRight: 4,
  },
  radioSelectedLabel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 14px",
    border: "1px solid #2EC376",
    cursor: "pointer",
    userSelect: "none",
    color: "#2EC376",
    height: 40,    
    marginRight: 4,
  },
  radioInput: {
    position: "absolute",
    opacity: 0,
    cursor: "pointer",

  },
  radioSpan: {
    color: "inherit",
  }
}