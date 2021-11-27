import type { Location } from 'history'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { validate } from 'src/features/send/sendToken'
import { SendTokenParams } from 'src/features/send/types'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Font } from 'src/styles/fonts'
import { isValidAddress } from 'src/utils/addresses'
import { amountFieldFromWei, amountFieldToWei } from 'src/utils/amount'

interface SendTokenForm extends Omit<SendTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: SendTokenForm = {
  recipient: '',
  amount: '',
  tokenId: '',
  comment: '',
}

export function PayFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const balances = useSelector((state: RootState) => state.wallet.balances)
  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)

  const onSubmit = (values: SendTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Send, params: amountFieldToWei(values) }))
    navigate('/payment-review')
  }

  const validateForm = (values: SendTokenForm) =>
    validate(amountFieldToWei(values), balances, txSizeLimitEnabled)

  // Keep form in sync with tx state
  useEffect(() => {
    const values = getInitialValues(location, tx)
    validateForm(values)
    onSubmit(values)
  }, [tx])

  return (
    <ScreenContentFrame>
      <h1 css={Font.h2Green}>Send Payment</h1>
    </ScreenContentFrame>
  )
}

function getInitialValues(location: Location<any>, tx: TxFlowTransaction | null): SendTokenForm {
  const recipient = location?.state?.recipient
  const params = new URLSearchParams(location.search)

  const valueInUSD = params.get('valueInUSD')
  const initialRecipient =
    recipient && isValidAddress(recipient) ? recipient : params.get('recipient') || ''
  if (!tx || !tx.params || tx.type !== TxFlowType.Send) {
    return {
      ...initialValues,
      recipient: initialRecipient,
      amount: valueInUSD || '',
      tokenId: params.get('tokenId') || '',
      comment: JSON.stringify({ spendOn: params.get('type'), issueID: params.get('issueID') }),
    }
  } else {
    return amountFieldFromWei(tx.params)
  }
}
