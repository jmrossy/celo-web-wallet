import React from 'react'
import { useDispatch } from 'react-redux'
import { Currency } from 'src/consts'
import { sendTokenActions, SendTokenParams } from 'src/features/send/sendToken'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: SendTokenParams = {
  // TODO set to empty string
  recipient: '0xa2972a33550c33ecfa4a02a0ea212ac98e77fa55',
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

        <div>
          <label>Recipient Address</label>
          <input type="text" name="recipient" onChange={handleChange} value={values.recipient} />
        </div>

        <div>
          <label>Amount</label>
          <input type="number" name="amount" onChange={handleChange} value={values.amount} />
        </div>

        <div>
          <label>Currency</label>
          <select name="currency" value={values.currency} onChange={handleChange}>
            <option value={Currency.CELO}>CELO</option>
            <option value={Currency.cUSD}>cUSD</option>
          </select>
        </div>

        <div>
          <label>Comment</label>
          <input type="text" name="comment" onChange={handleChange} value={values.comment} />
        </div>

        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}
