import { render } from '@testing-library/react'
import * as React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { RootState } from '../app/rootReducer'
import { walletInitialState } from '../features/wallet/walletSlice'
import { RecursivePartial } from '../utils/typescript'

// Needs to be kept in sync with all slices used in store
export function getFullInitialState(): RootState {
  return {
    wallet: walletInitialState,
  }
}

export function createMockStore(overrides: RecursivePartial<RootState> = {}) {
  const initialState = getFullInitialState()
  // Apply overrides. Note: only merges one level deep
  for (const key of Object.keys(overrides)) {
    // @ts-ignore overrides already checked to be partial of RootState
    initialState[key] = { ...initialState[key], ...overrides[key] }
  }
  return configureStore<RootState>()(initialState)
}

export function renderWithProvider(
  node: React.ReactElement,
  overrides?: RecursivePartial<RootState>
) {
  const mockStore = createMockStore(overrides)
  return render(<Provider store={mockStore}>{node}</Provider>)
}
