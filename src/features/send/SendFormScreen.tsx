import React from 'react'
import { Currency } from 'src/consts'
import { useCustomForm } from 'src/utils/useCustomForm'

interface SendFormState {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
}

const initialValues: SendFormState = {
  recipient: '',
  amount: 0,
  currency: Currency.cUSD,
  comment: '',
}

export function SendFormScreen() {
  const onSubmit = (values: SendFormState) => {
    console.log(values)
  }

  const { values, handleChange, handleSubmit } = useCustomForm<SendFormState, any>(
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
