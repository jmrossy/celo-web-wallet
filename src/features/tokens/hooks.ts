import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'

export function useTokens() {
  return useSelector((s: RootState) => s.tokens.byAddress)
}
