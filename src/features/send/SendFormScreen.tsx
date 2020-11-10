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
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'
import { Currency } from 'src/consts'
import { sendStarted } from 'src/features/send/sendSlice'
import { SendTokenParams, validate } from 'src/features/send/sendToken'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'

const initialValues: SendTokenParams = {
  // TODO set to empty string
  recipient: '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55',
  amount: 0,
  currency: Currency.CELO,
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const staleBalances = useSelector((state: RootState) => state.wallet.balances)
  const { transaction: txn } = useSelector((state: RootState) => state.send)

  const onSubmit = async (values: SendTokenParams) => {
    if (validateInputs() === null) {
      const safeValues = { ...values, amount: parseFloat(values.amount.toString()) }
      dispatch(sendStarted(safeValues))
      navigate('/send-review')
    }
  }

  const { values, touched, handleChange, handleBlur, handleSubmit, resetValues } = useCustomForm<
    SendTokenParams,
    any
  >(txn ?? initialValues, onSubmit)

  const { inputErrors, validateInputs } = useInputValidation(touched, () =>
    validate(values, staleBalances)
  )

  //-- if the transaction gets reset, reset the screen as well
  useEffect(() => {
    if (txn === null) {
      resetValues(initialValues)
    }
  }, [txn])

  const onRequest = () => {
    alert('Not Impelemented')
  }

  const onCopyAddress = async () => {
    await navigator.clipboard.writeText(values.recipient)
  }

  return (
    <ScreenFrameWithFeed>
      <Box direction="column" styles={style.contentContainer}>
        <form onSubmit={handleSubmit}>
          <h1 css={style.title}>Send or Request Payment</h1>

          <Box direction="column" styles={style.inputRow}>
            <label css={style.inputLabel}>Recipient Address or Phone Number</label>

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
                margin="0 8px"
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
                  classes={{ container: { minWidth: 52 } }}
                />
                <RadioBox
                  tabIndex={1}
                  label="CELO"
                  value={Currency.CELO}
                  name="currency"
                  checked={values.currency === Currency.CELO}
                  onChange={handleChange}
                  classes={{ container: { minWidth: 52 } }}
                />
              </Box>
            </Box>
          </Box>

          <Box direction="column" align="start" styles={style.inputRow}>
            <label css={style.inputLabel}>Comment (optional)</label>
            <TextArea
              name="comment"
              width={346}
              rows={8}
              height={80}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.comment}
            />
          </Box>

          <Box direction="row" justify="between">
            <Box styles={{ width: '48%' }}>
              <Button type="submit" size="m" icon={SendPaymentIcon}>
                Send Payment
              </Button>
            </Box>
            <Box styles={{ width: '48%' }}>
              <Button type="button" size="m" onClick={onRequest} icon={RequestPaymentIcon}>
                Request Payment
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
    height: '100%',
    paddingLeft: 65,
    paddingTop: 30,
    maxWidth: 500,
    width: '100%',
  },
  notificationContainer: {
    width: '100%',
    margin: '16px 0',
  },
  notification: {
    backgroundColor: Color.accentBlue,
    borderRadius: 5,
    padding: '8px 16px',
    width: '75%',
  },
  notificationText: {
    fontSize: 20,
    fontWeight: 400,
    color: Color.primaryWhite,
  },
  title: {
    color: '#3488EC',
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
    height: '100%',
    width: '100%',
    marginLeft: 8,
  },
}
