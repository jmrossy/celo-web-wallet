import { RootState } from 'src/app/rootReducer'
import { Currency } from 'src/consts'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, select } from 'typed-redux-saga'

export interface SendPaymentParams {
  recipient: string
  amount: number
  currency: Currency
  comment?: string
}

export interface PaymentContext {
  address: string
}

function* sendPayment(action: SendPaymentParams) {
  const address = yield* select((state: RootState) => state.wallet.address)
  yield* call(doSendPayment, { address, ...action })
}

async function doSendPayment({
  address,
  recipient,
  amount,
  currency,
  comment,
}: SendPaymentParams & PaymentContext) {
  //TODO
  console.log('send payment')
}

export const {
  wrappedSaga: sendPaymentSaga,
  reducer: sendPaymentReducer,
  actions: sendPaymentActions,
} = createMonitoredSaga<SendPaymentParams>(sendPayment, { name: 'send-payment' })
