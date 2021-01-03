import { utils } from 'ethers'
import { Location } from 'history'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import PasteIcon from 'src/components/icons/paste.svg'
import { AddressInput } from 'src/components/input/AddressInput'
import { CurrencyRadioBox } from 'src/components/input/CurrencyRadioBox'
import { NumberInput } from 'src/components/input/NumberInput'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Currency } from 'src/consts'
import { sendStarted } from 'src/features/send/sendSlice'
import { SendTokenParams, validate } from 'src/features/send/sendToken'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { fromWei, toWei } from 'src/utils/amount'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

interface SendTokenForm extends Omit<SendTokenParams, 'amountInWei'> {
  amount: number | string
}

const initialValues: SendTokenForm = {
  recipient: '',
  amount: '',
  currency: Currency.cUSD,
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

  const {
    values,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  } = useCustomForm<SendTokenForm>(getFormInitialValues(location, tx), onSubmit)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getFormInitialValues(location, tx))
  }, [tx])

  const { inputErrors, areInputsValid } = useInputValidation(touched, () =>
    validate(toSendTokenParams(values), balances)
  )

  const onPasteAddress = async () => {
    const value = await tryClipboardGet()
    if (!value || !utils.isAddress(value)) return
    setValues({ ...values, recipient: value })
  }

  const onClose = () => {
    navigate('/')
  }

  return (
    <ScreenContentFrame onClose={onClose}>
      <div css={style.content}>
        <form onSubmit={handleSubmit}>
          <h1 css={Font.h2Green}>Send Payment</h1>

          <Box direction="column" margin="0 0 2em 0">
            <label css={style.inputLabel}>Recipient Address</label>

            <Box direction="row" justify="start" align="end">
              <AddressInput
                fillWidth={true}
                width="initial"
                name="recipient"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.recipient}
                {...inputErrors['recipient']}
                placeholder="0x1234..."
              />
              {isClipboardReadSupported() ? (
                <Button size="icon" type="button" margin="0 0 0 0.5em" onClick={onPasteAddress}>
                  <img src={PasteIcon} alt="Paste Address" css={style.copyIcon} />
                </Button>
              ) : (
                <div css={[style.copyIcon, { marginLeft: '0.75em' }]}></div>
              )}
            </Box>
          </Box>

          <Box direction="row" styles={style.inputRow} justify="between">
            <Box direction="column" justify="end" align="start">
              <label css={style.inputLabel}>Amount</label>
              <Box direction="row" align="center">
                <NumberInput
                  step="0.01"
                  width="3.5em"
                  margin="0 0.75em 0 0"
                  name="amount"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount.toString()}
                  {...inputErrors['amount']}
                  placeholder="1.00"
                />
                <TextButton onClick={() => alert('max')} styles={style.maxAmountButton}>
                  Max Amount
                </TextButton>
              </Box>
            </Box>
            <Box direction="column" align="start" margin="0 0 0 2em">
              <label css={style.inputLabel}>Currency</label>
              <Box direction="row" justify="between" align="end" styles={style.radioBox}>
                <CurrencyRadioBox
                  tabIndex={0}
                  label="cUSD"
                  value={Currency.cUSD}
                  name="currency"
                  checked={values.currency === Currency.cUSD}
                  onChange={handleChange}
                  containerCss={{ marginRight: '0.5em' }}
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
              minWidth="16em"
              maxWidth="24em"
              minHeight="5em"
              maxHeight="7em"
              fillWidth={true}
            />
          </Box>

          <Button type="submit" size="m" margin="0 1em 0 0">
            Continue
          </Button>
        </form>
      </div>
    </ScreenContentFrame>
  )
}

function getFormInitialValues(location: Location<any>, tx: SendTokenParams | null) {
  const recipient = location?.state?.recipient
  const initialRecipient = recipient && utils.isAddress(recipient) ? recipient : ''
  if (!tx) {
    return {
      ...initialValues,
      recipient: initialRecipient,
    }
  } else {
    return toSendTokenForm(tx)
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
      amountInWei: '0',
    }
  }
}

function toSendTokenForm(values: SendTokenParams): SendTokenForm {
  return {
    ...values,
    amount: fromWei(values.amountInWei),
  }
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '26em',
    paddingBottom: '1em',
  },
  inputRow: {
    margin: '0 0 2em 0',
    [mq[768]]: {
      margin: '0 2.1em 2em 0',
    },
  },
  inputLabel: {
    ...Font.inputLabel,
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
  maxAmountButton: {
    fontWeight: 300,
    fontSize: '0.9em',
    [mq[768]]: {
      fontSize: '1em',
    },
  },
}
