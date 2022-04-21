import { appSelect } from 'src/app/appSelect'
import { createMonitoredSaga } from 'src/utils/saga'

interface sendNftParams {
  contractAddress: Address
  id: string
}

function* sendNft({ contractAddress, id }: sendNftParams) {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot send Nfts before address is set')
}

export const {
  name: sendNftSagaName,
  wrappedSaga: sendNftSaga,
  reducer: sendNftReducer,
  actions: sendNftActions,
} = createMonitoredSaga<sendNftParams>(sendNft, 'sendNft')
