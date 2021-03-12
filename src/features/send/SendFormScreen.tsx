import { utils } from 'ethers'
import { Location } from 'history'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import PasteIcon from 'src/components/icons/paste.svg'
import { AddressInput } from 'src/components/input/AddressInput'
import { NumberInput } from 'src/components/input/NumberInput'
import { SelectInput } from 'src/components/input/SelectInput'
import { TextArea } from 'src/components/input/TextArea'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { validate } from 'src/features/send/sendToken'
import { SendTokenParams } from 'src/features/send/types'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Balances } from 'src/features/wallet/types'
import { getTokenBalance } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { cUSD } from 'src/tokens'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'
import { useCustomForm } from 'src/utils/useCustomForm'

interface SendTokenForm extends Omit<SendTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: SendTokenForm = {
  recipient: '',
  amount: '',
  tokenId: cUSD.id,
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)

  const onSubmit = (values: SendTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Send, params: amountFieldToWei(values) }))
    navigate('/send-review')
  }

  const validateForm = (values: SendTokenForm) =>
    validate(amountFieldToWei(values), balances, txSizeLimitEnabled)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  } = useCustomForm<SendTokenForm>(getInitialValues(location, tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(location, tx))
  }, [tx])

  const onPasteAddress = async () => {
    const value = await tryClipboardGet()
    if (!value || !utils.isAddress(value)) return
    setValues({ ...values, recipient: value })
  }

  const onUseMax = () => {
    const tokenId = values.tokenId
    const token = balances.tokens[tokenId]
    const balance = getTokenBalance(balances, token)
    const maxAmount = fromWeiRounded(balance, token, true)
    setValues({ ...values, amount: maxAmount })
  }

  const selectOptions = useMemo(() => getSelectOptions(balances), [balances])

  return (
    <ScreenContentFrame>
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
                placeholder="0x1234..."
                {...errors['recipient']}
              />
              {isClipboardReadSupported() ? (
                <Button size="icon" type="button" margin="0 0 0 0.5em" onClick={onPasteAddress}>
                  <img src={PasteIcon} alt="Paste Address" css={style.copyIcon} />
                </Button>
              ) : (
                <div css={style.copyIconPlaceholder}></div>
              )}
            </Box>
          </Box>

          <Box direction="row" styles={style.inputRow} justify="between">
            <Box direction="column" justify="end" align="start">
              <label css={style.inputLabel}>Amount</label>
              <div css={style.amountContainer}>
                <NumberInput
                  step="0.01"
                  width="6.5em"
                  margin="0 0.75em 0 0"
                  name="amount"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount}
                  placeholder="1.00"
                  {...errors['amount']}
                />
                <TextButton onClick={onUseMax} styles={style.maxAmountButton}>
                  Max Amount
                </TextButton>
              </div>
            </Box>
            <Box direction="column" align="start" margin="0 0 0 1.5em">
              <label css={style.inputLabel}>Currency</label>
              <SelectInput
                name="tokenId"
                autoComplete={false}
                width="3em"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.tokenId}
                options={selectOptions}
                placeholder="Currency"
                {...errors['tokenId']}
              />
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

function getInitialValues(location: Location<any>, tx: TxFlowTransaction | null): SendTokenForm {
  const recipient = location?.state?.recipient
  const initialRecipient = recipient && utils.isAddress(recipient) ? recipient : ''
  if (!tx || !tx.params || tx.type !== TxFlowType.Send) {
    return {
      ...initialValues,
      recipient: initialRecipient,
    }
  } else {
    return amountFieldFromWei(tx.params)
  }
}

function getSelectOptions(balances: Balances) {
  return Object.values(balances.tokens).map((t) => ({
    display: t.label,
    value: t.id,
  }))
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
  amountContainer: {
    display: 'flex',
    flexDirection: 'column',
    [mq[480]]: {
      flexDirection: 'row',
    },
  },
  maxAmountButton: {
    margin: '0.6em 0 0 0.2em',
    textAlign: 'left',
    fontWeight: 300,
    fontSize: '0.9em',
    [mq[480]]: {
      margin: 0,
    },
    [mq[768]]: {
      fontSize: '1em',
    },
  },
}
