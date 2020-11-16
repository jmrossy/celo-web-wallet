import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import PasteIcon from 'src/components/icons/paste.svg'
import RequestPaymentIcon from 'src/components/icons/request_payment_white.svg'
import SendPaymentIcon from 'src/components/icons/send_payment_white.svg'
import { Identicon } from 'src/components/Identicon'
import { AddressInput } from 'src/components/input/AddressInput'
import { MoneyValueInput } from 'src/components/input/MoneyValueInput'
import { RadioBox } from 'src/components/input/RadioBox'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Currency } from 'src/consts'
import { sendStarted } from 'src/features/send/sendSlice'
import { SendTokenParams, validate } from 'src/features/send/sendToken'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { fromWei, toWei } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

interface SendTokenForm extends Omit<SendTokenParams, 'amountInWei'> {
  amount: number
}

const initialValues: SendTokenForm = {
  // TODO set to empty string
  recipient: '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55',
  amount: 0,
  currency: Currency.CELO,
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const tx = useSelector((state: RootState) => state.send.transaction)

  const onSubmit = (values: SendTokenForm) => {
    if (areInputsValid()) {
      dispatch(sendStarted(toSendTokenParams(values)))
      navigate('/send-review')
    }
  }

  const { values, touched, handleChange, handleBlur, handleSubmit, resetValues } = useCustomForm<
    SendTokenForm,
    any
  >(toSendTokenForm(tx) ?? initialValues, onSubmit)

  const { inputErrors, areInputsValid } = useInputValidation(touched, () =>
    validate(toSendTokenParams(values), balances)
  )

  //-- if the transaction gets reset, reset the screen as well
  useEffect(() => {
    if (tx === null) {
      resetValues(initialValues)
    }
  }, [tx])

  const onRequest = () => {
    alert('Not Implemented')
  }

  const onCopyAddress = async () => {
    await navigator.clipboard.writeText(values.recipient)
  }

  return (
    <ScreenContentFrame>
      <form onSubmit={handleSubmit}>
        <h1 css={style.title}>Send or Request Payment</h1>

        <Box direction="column" styles={style.inputRow}>
          <label css={style.inputLabel}>Recipient Address</label>

          <Box direction="row" justify="start" align="end">
            <AddressInput
              width={346}
              name="recipient"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.recipient}
              {...inputErrors['recipient']}
            />
            <Button
              size="icon"
              type="button"
              color={Color.fillLight}
              margin="0 0.5em"
              onClick={onCopyAddress}
            >
              <img src={PasteIcon} alt="Copy to Clipbard" css={style.copyIcon} />
            </Button>
            <Identicon address={values.recipient} />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <Box direction="column" justify="end" align="start">
            <label css={style.inputLabel}>Amount</label>
            <MoneyValueInput
              width={173}
              name="amount"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.amount.toString()}
              {...inputErrors['amount']}
            />
          </Box>
          <Box direction="column" align="start" styles={{ width: '50%' }}>
            <label css={style.inputLabel}>Currency</label>
            <Box direction="row" justify="start" align="end" styles={style.radioBox}>
              <RadioBox
                tabIndex={0}
                label="cUSD"
                value={Currency.cUSD}
                name="currency"
                checked={values.currency === Currency.cUSD}
                onChange={handleChange}
                containerCss={{ minWidth: 52 }}
              />
              <RadioBox
                tabIndex={1}
                label="CELO"
                value={Currency.CELO}
                name="currency"
                checked={values.currency === Currency.CELO}
                onChange={handleChange}
                containerCss={{ minWidth: 52 }}
              />
            </Box>
          </Box>
        </Box>

        <Box direction="column" align="start" styles={style.inputRow}>
          <label css={style.inputLabel}>Comment (optional)</label>
          <TextArea
            name="comment"
            value={values.comment}
            placeholder={'Thanks for lunch!'}
            onChange={handleChange}
            onBlur={handleBlur}
            minWidth="22em"
            maxWidth="26em"
            minHeight="5em"
            maxHeight="7em"
          />
        </Box>

        <Box direction="row" justify="start">
          <Button type="submit" size="m" icon={SendPaymentIcon} margin="0 1em 0 0">
            Send Payment
          </Button>
          <Button type="button" size="m" onClick={onRequest} icon={RequestPaymentIcon}>
            Request Payment
          </Button>
        </Box>
      </form>
    </ScreenContentFrame>
  )
}

function toSendTokenParams(values: SendTokenForm): SendTokenParams {
  try {
    return {
      ...values,
      amountInWei: toWei(values.amount).toString(),
    }
  } catch (error) {
    return {
      ...values,
      amountInWei: '0', // TODO Makes this NaN?
    }
  }
}

function toSendTokenForm(values: SendTokenParams | null): SendTokenForm | null {
  if (!values) return null
  return {
    ...values,
    amount: fromWei(values.amountInWei),
  }
}

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
    paddingLeft: '4em',
    paddingTop: '2em',
    width: '100%',
  },
  title: {
    color: Color.accentBlue,
    fontWeight: 400,
    fontSize: '2em',
    marginTop: 0,
    marginBottom: '1em',
  },
  inputRow: {
    marginBottom: '2em',
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
    marginBottom: '0.5em',
  },
  copyIcon: {
    height: '1em',
    width: '1.25em',
  },
  radioBox: {
    height: '100%',
    width: '100%',
    marginLeft: '0.5em',
  },
}
