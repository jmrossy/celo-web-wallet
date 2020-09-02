import React from 'react'
import { useDispatch } from 'react-redux'
import { Currency } from 'src/consts'
import { sendTokenActions, SendTokenParams } from 'src/features/send/sendToken'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: SendTokenParams = {
  recipient: '',
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
