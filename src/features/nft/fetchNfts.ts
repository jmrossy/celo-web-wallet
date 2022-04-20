import { appSelect } from 'src/app/appSelect'
import { createMonitoredSaga } from 'src/utils/saga'

function* fetchNfts() {
  const address = yield* appSelect((state) => state.wallet.address)
  if (!address) throw new Error('Cannot fetch Nfts before address is set')
}

export const {
  name: fetchNftsSagaName,
  wrappedSaga: fetchNftsSaga,
  reducer: fetchNftsReducer,
  actions: fetchNftsActions,
} = createMonitoredSaga(fetchNfts, 'fetchNfts')
