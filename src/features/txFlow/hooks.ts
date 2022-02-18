import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'

export function useFlowTransaction() {
  return useSelector((state: RootState) => state.txFlow.transaction)
}
