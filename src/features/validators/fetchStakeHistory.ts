import type { RootState } from 'src/app/rootReducer'
import { createMonitoredSaga } from 'src/utils/saga'
import { select } from 'typed-redux-saga'

function* fetchStakeHistory() {
  const { groups, lastUpdated } = yield* select(
    (state: RootState) => state.validators.validatorGroups
  )
}

export const {
  name: fetchStakeHistorySagaName,
  wrappedSaga: fetchStakeHistorySaga,
  reducer: fetchStakeHistoryReducer,
  actions: fetchStakeHistoryActions,
} = createMonitoredSaga(fetchStakeHistory, 'fetchStakeHistory')
