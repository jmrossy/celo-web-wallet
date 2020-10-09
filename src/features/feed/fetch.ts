import { RootState } from 'src/app/rootReducer'
import { Currency } from 'src/consts'
import { addTransactions, TransactionMap } from 'src/features/feed/feedSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'

interface BlockscoutTransferTx {
  blockNumber: number
  transactionHash: string
  timestamp: string
  gasPrice: string
  gasUsed: string
  feeToken: string
  gatewayFee: string
  gatewayFeeRecipient: string
  input: string
  celoTransfers: BlockscoutCeloTransfer[]
}

interface BlockscoutCeloTransfer {
  fromAddressHash: string
  toAddressHash: string
  token: string
  value: string
}

function* fetchFeed() {
  const address = yield* select((state: RootState) => state.wallet.address)
  const lastUpdated = yield* select((state: RootState) => state.feed.lastUpdated)

  if (!address) {
    return
  }

  const newTransactions = yield* call(doFetchFeed, address, lastUpdated)
  yield* put(addTransactions(newTransactions))
}

async function doFetchFeed(address: string, lastUpdated: number | null): Promise<TransactionMap> {
  // TODO
  return {
    hash: {
      hash: 'hash',
      from: 'from',
      to: 'to',
      token: Currency.CELO,
      value: '10000000000000',
      blockNumber: 100,
      timestamp: 1602199752489,
      gasPrice: '500000000',
      gasUsed: '10000000',
    },
  }
}

export const {
  wrappedSaga: fetchFeedSaga,
  reducer: fetchFeedReducer,
  actions: fetchFeedActions,
} = createMonitoredSaga(fetchFeed, { name: 'fetchFeed' })
