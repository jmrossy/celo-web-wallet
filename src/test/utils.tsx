import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import type { RootState } from 'src/app/rootReducer'
import { monitoredSagas } from 'src/app/rootSaga'
import { walletInitialState } from 'src/features/wallet/walletSlice'
import { SagaState } from 'src/utils/saga'
import { RecursivePartial } from 'src/utils/typescript'

// Needs to be kept in sync with all slices used in store
// TODO find a way to create full mock state without requiring this to be
// updated when state schema changes
export function getFullInitialState(): RecursivePartial<RootState> {
  return {
    wallet: walletInitialState,
    saga: getSagaDefaultState() as any,
  }
}

function getSagaDefaultState() {
  const sagas = Object.keys(monitoredSagas)
  const state: { [name: string]: SagaState } = {}
  sagas.forEach((sagaName) => (state[sagaName] = { status: null, error: null }))
  return state
}

export function createMockStore(overrides: RecursivePartial<RootState> = {}) {
  const initialState = getFullInitialState()
  // Apply overrides. Note: only merges one level deep
  for (const key of Object.keys(overrides)) {
    // @ts-ignore overrides already checked to be partial of RootState
    initialState[key] = { ...initialState[key], ...overrides[key] }
  }
  return configureStore<RecursivePartial<RootState>>()(initialState)
}

export function renderWithProvider(
  node: React.ReactElement,
  overrides?: RecursivePartial<RootState>
) {
  const mockStore = createMockStore(overrides)
  return render(<Provider store={mockStore}>{node}</Provider>)
}
