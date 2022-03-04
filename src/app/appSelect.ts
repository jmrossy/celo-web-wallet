import type { AppState } from 'src/app/store'
import { select } from 'typed-redux-saga'

// Use in sagas for better typing when selecting from redux state
export function* appSelect<T>(fn: (state: AppState) => T) {
  const state = yield* select(fn)
  return state
}
