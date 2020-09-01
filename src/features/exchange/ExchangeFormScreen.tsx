import React from 'react'
import { useDispatch } from 'react-redux'
import { Currency } from 'src/consts'
import { exchangeTokenActions, ExchangeTokenParams } from 'src/features/exchange/exchangeToken'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: ExchangeTokenParams = {
  amount: 0,
  fromCurrency: Currency.cUSD,
  toCurrency: Currency.CELO,
}

export function ExchangeFormScreen() {
  const dispatch = useDispatch()

  const onSubmit = (values: ExchangeTokenParams) => {
    dispatch(exchangeTokenActions.trigger(values))
  }

  const { values, handleChange, handleSubmit } = useCustomForm<ExchangeTokenParams, any>(
    initialValues,
    onSubmit
  )

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Exchange Currency</h1>

        <label>Amount</label>
        <input type="number" name="amount" onChange={handleChange} value={values.amount} />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
