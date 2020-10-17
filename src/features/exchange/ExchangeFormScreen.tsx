import React from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'src/components/Button'
import { MoneyValueInput } from 'src/components/input/MoneyValueInput'
import { Box } from 'src/components/layout/Box'
import { Currency } from 'src/consts'
import { exchangeTokenActions, ExchangeTokenParams } from 'src/features/exchange/exchangeToken'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: ExchangeTokenParams = {
  amount: 0,
  fromCurrency: Currency.cUSD,
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

        <Box direction="column">
          <label>Amount</label>
          <MoneyValueInput
            name="amount"
            width={200}
            margin={'1rem 0'}
            onChange={handleChange}
            value={values.amount.toString()}
          />

          <label>Currency</label>
          <div>
            <select name="fromCurrency" value={values.fromCurrency} onChange={handleChange}>
              <option value={Currency.CELO}>CELO</option>
              <option value={Currency.cUSD}>cUSD</option>
            </select>
          </div>

          <Button type="submit" margin={'1rem 0'}>
            Submit
          </Button>
        </Box>
      </form>
    </div>
  )
}
