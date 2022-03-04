import { useAppSelector } from 'src/app/hooks'

export function useFlowTransaction() {
  return useAppSelector((state) => state.txFlow.transaction)
}
