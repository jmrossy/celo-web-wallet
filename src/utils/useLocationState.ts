import { useLocation } from 'react-router-dom'

// Util to get typed location state
// See https://github.com/remix-run/history/issues/930
export function useLocationState<T>(): T | null {
  const location = useLocation()
  const state = location?.state ?? null
  return state as T | null
}
