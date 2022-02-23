import { useAppSelector } from 'src/app/hooks'

export function useTokens() {
  return useAppSelector((s) => s.tokens.byAddress)
}
