import { parseEther } from 'ethers/lib/utils'
import { Currency, MAX_EXCHANGE_TOKEN_SIZE } from 'src/consts'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

export interface ExchangeTokenParams {
  amount: number
  fromCurrency: Currency
  toCurrency: Currency
}

function* exchangeToken(context: ExchangeTokenParams) {
  // const address = yield* select((state: RootState) => state.wallet.address)
  yield* call(doExchangeToken, context)
}

async function doExchangeToken({ amount, fromCurrency, toCurrency }: ExchangeTokenParams) {
  logger.info(`Exchanging ${amount} ${fromCurrency} to ${toCurrency}`)

  const amountInWei = parseEther('' + amount)
  if (amountInWei.lte(0) || amountInWei.gte(MAX_EXCHANGE_TOKEN_SIZE)) {
    logger.error(`Invalid amount: ${amountInWei.toString()}`)
    // TODO show error
    return
  }

  // TODO implement
}

export const {
  wrappedSaga: exchangeTokenSaga,
  reducer: exchangeTokenReducer,
  actions: exchangeTokenActions,
} = createMonitoredSaga<ExchangeTokenParams>(exchangeToken, { name: 'exchange-token' })
