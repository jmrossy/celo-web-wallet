import { ChangeEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import PasteIcon from 'src/components/icons/paste.svg'
import { AmountAndCurrencyInput } from 'src/components/input/AmountAndCurrencyInput'
import { SelectInput } from 'src/components/input/SelectInput'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useBalances } from 'src/features/balances/hooks'
import { getTokenBalance } from 'src/features/balances/utils'
import { useContactsAndAccountsSelect } from 'src/features/contacts/hooks'
import { validate } from 'src/features/send/sendToken'
import { SendTokenParams } from 'src/features/send/types'
import { useTokens } from 'src/features/tokens/hooks'
import { isNativeTokenAddress } from 'src/features/tokens/utils'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { isValidAddress } from 'src/utils/addresses'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useLocationState } from 'src/utils/useLocationState'

interface LocationState {
  recipient?: string
}

interface SendTokenForm extends Omit<SendTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: SendTokenForm = {
  recipient: '',
  amount: '',
  tokenAddress: '',
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const locationState = useLocationState<LocationState>()

  const balances = useBalances()
  const tokens = useTokens()
  const tx = useFlowTransaction()
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)
  const contactOptions = useContactsAndAccountsSelect()

  const onSubmit = (values: SendTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Send, params: amountFieldToWei(values) }))
    navigate('/send-review')
  }

  const validateForm = (values: SendTokenForm) =>
    validate(amountFieldToWei(values), balances, tokens, txSizeLimitEnabled)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
    resetErrors,
  } = useCustomForm<SendTokenForm>(getInitialValues(locationState, tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(locationState, tx))
  }, [tx])

  const onPasteAddress = async () => {
    const value = await tryClipboardGet()
    if (!value || !isValidAddress(value)) return
    setValues({ ...values, recipient: value })
  }

  const onUseMax = () => {
    if (!values.tokenAddress) return
    const tokenAddress = values.tokenAddress
    const token = tokens[tokenAddress]
    const balance = getTokenBalance(balances, token)
    const maxAmount = fromWeiRounded(balance, token, true)
    setValues({ ...values, amount: maxAmount })
    resetErrors()
  }

  const onTokenSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const isNative = isNativeTokenAddress(value)
    // Reset comment if token is not native
    const comment = isNative ? values.comment : ''
    setValues({ ...values, [name]: value, comment })
    resetErrors()
  }

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <form onSubmit={handleSubmit}>
          <h1 css={Font.h2Green}>Send Payment</h1>

          <Box direction="column" margin="0 0 2em 0">
            <label css={style.inputLabel}>Recipient</label>
            <Box direction="row" justify="start" align="end">
              <SelectInput
                name="recipient"
                autoComplete={true}
                fillWidth={true}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.recipient}
                options={contactOptions}
                maxOptions={4}
                allowRawOption={true}
                placeholder="0x123 or contact"
                hideChevron={true}
                {...errors['recipient']}
              />
              {isClipboardReadSupported() ? (
                <Button
                  size="icon"
                  type="button"
                  margin="0 0 1px 0.5em"
                  onClick={onPasteAddress}
                  title="Paste"
                >
                  <img src={PasteIcon} alt="Paste Address" css={style.copyIcon} />
                </Button>
              ) : (
                <div css={style.copyIconPlaceholder}></div>
              )}
            </Box>
          </Box>

          <div css={style.inputRow}>
            <Box direction="row" justify="between" align="start">
              <label css={style.inputLabel}>Amount</label>
              <TextButton onClick={onUseMax} styles={style.maxAmountButton}>
                Use Max
              </TextButton>
            </Box>
            <AmountAndCurrencyInput
              tokenValue={values.tokenAddress}
              onTokenSelect={onTokenSelect}
              onTokenBlur={handleBlur}
              amountValue={values.amount}
              onAmountChange={handleChange}
              onAmountBlur={handleBlur}
              errors={errors}
            />
          </div>

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
              minHeight="4em"
              maxHeight="6em"
              fillWidth={true}
              disabled={!isNativeTokenAddress(values.tokenAddress)}
              {...errors['comment']}
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

function getInitialValues(
  locationState: LocationState | null,
  tx: TxFlowTransaction | null
): SendTokenForm {
  const recipient = locationState?.recipient
  const initialRecipient = recipient && isValidAddress(recipient) ? recipient : ''
  if (!tx || !tx.params || tx.type !== TxFlowType.Send) {
    return {
      ...initialValues,
      recipient: initialRecipient,
    }
  } else {
    return amountFieldFromWei(tx.params)
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
  copyIconPlaceholder: {
    display: 'none',
    [mq[768]]: {
      display: 'block',
      height: '1em',
      width: '1.25em',
      marginLeft: '0.75em',
    },
  },
  maxAmountButton: {
    fontWeight: 400,
    fontSize: '0.9em',
  },
}
