import { utils } from 'ethers'
import { Location } from 'history'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import PasteIcon from 'src/components/icons/paste.svg'
import { AddressInput } from 'src/components/input/AddressInput'
import { CurrencyRadioBox } from 'src/components/input/CurrencyRadioBox'
import { MoneyValueInput } from 'src/components/input/MoneyValueInput'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Currency } from 'src/consts'
import { sendStarted } from 'src/features/send/sendSlice'
import { SendTokenParams, validate } from 'src/features/send/sendToken'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { fromWei, toWei } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

interface SendTokenForm extends Omit<SendTokenParams, 'amountInWei'> {
  amount: number | string
}

const initialValues: SendTokenForm = {
  recipient: '',
  amount: '',
  currency: Currency.CELO,
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
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
  >(toSendTokenForm(tx) ?? getFormInitialValues(location), onSubmit)

  const { inputErrors, areInputsValid } = useInputValidation(touched, () =>
    validate(toSendTokenParams(values), balances)
  )

  //-- if the transaction gets reset, reset the screen as well
  useEffect(() => {
    if (tx === null) {
      resetValues(getFormInitialValues(location))
    }
  }, [tx])

  const onCopyAddress = async () => {
    await navigator.clipboard.writeText(values.recipient)
  }

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <form onSubmit={handleSubmit}>
          <h1 css={[Font.h2Green, style.pageTitle]}>Send Payment</h1>

          <Box direction="column" styles={style.inputRow}>
            <label css={style.inputLabel}>Recipient Address</label>

            <Box direction="row" justify="start" align="end">
              <AddressInput
                width="22em"
                name="recipient"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.recipient}
                {...inputErrors['recipient']}
                placeholder="0x1234..."
              />
              <Button
                size="icon"
                type="button"
                color={Color.primaryGreen}
                margin="0 0.5em"
                onClick={onCopyAddress}
              >
                <img src={PasteIcon} alt="Copy to Clipbard" css={style.copyIcon} />
              </Button>
            </Box>
          </Box>

          <Box direction="row" styles={style.inputRow} justify="between">
            <Box direction="column" justify="end" align="start">
              <label css={style.inputLabel}>Amount to Send</label>
              <MoneyValueInput
                width="10em"
                name="amount"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.amount.toString()}
                {...inputErrors['amount']}
                placeholder="1.00"
              />
            </Box>
            <Box direction="column" align="start" styles={{ width: '50%', marginLeft: '2em' }}>
              <label css={style.inputLabel}>Currency</label>
              <Box direction="row" justify="start" align="end" styles={style.radioBox}>
                <CurrencyRadioBox
                  tabIndex={0}
                  label="cUSD"
                  value={Currency.cUSD}
                  name="currency"
                  checked={values.currency === Currency.cUSD}
                  onChange={handleChange}
                />
                <CurrencyRadioBox
                  tabIndex={1}
                  label="CELO"
                  value={Currency.CELO}
                  name="currency"
                  checked={values.currency === Currency.CELO}
                  onChange={handleChange}
                />
              </Box>
            </Box>
          </Box>

          <Box direction="column" align="start" styles={style.inputRow}>
            <label css={style.inputLabel}>Comment (optional)</label>
            <TextArea
              name="comment"
              value={values.comment}
              placeholder="Dinner on Tuesday"
              onChange={handleChange}
              onBlur={handleBlur}
              minWidth="22em"
              maxWidth="26em"
              minHeight="5em"
              maxHeight="7em"
            />
          </Box>

          <Box direction="row" justify="start">
            <Button type="submit" size="m" margin="0 1em 0 0">
              Continue
            </Button>
            {/* <Button type="button" size="m" onClick={onRequest} icon={RequestPaymentIcon}>
              Request Payment
            </Button> */}
          </Box>
        </form>
      </div>
    </ScreenContentFrame>
  )
}

function getFormInitialValues(location: Location<any>) {
  const recipient = location?.state?.recipient
  if (recipient && utils.isAddress(recipient)) {
    return {
      ...initialValues,
      recipient,
    }
  } else {
    return initialValues
  }
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
  pageTitle: {
    marginTop: 0,
  },
  content: {
    width: '100%',
    maxWidth: '28em',
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
  },
}
