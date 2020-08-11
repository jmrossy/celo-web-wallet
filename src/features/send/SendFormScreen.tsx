import React from 'react'
import { useDispatch } from 'react-redux'
import { Currency } from 'src/consts'
import { sendPaymentActions, SendPaymentParams } from 'src/features/send/sendPayment'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: SendPaymentParams = {
  recipient: '',
  amount: 0,
  currency: Currency.cUSD,
  comment: '',
}

export function SendFormScreen() {
  const dispatch = useDispatch()

  const onSubmit = (values: SendPaymentParams) => {
    console.log(values)
    dispatch(sendPaymentActions.trigger(values))
  }

  const { values, handleChange, handleSubmit } = useCustomForm<SendPaymentParams, any>(
    initialValues,
    onSubmit
  )

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Send Payment</h1>

        <label>Recipient Address</label>
        <input type="text" name="recipient" onChange={handleChange} value={values.recipient} />

        <label>Amount</label>
        <input type="number" name="amount" onChange={handleChange} value={values.amount} />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
