import { useMemo } from 'react'
import { appSelect } from 'src/app/appSelect'
import { useAppSelector } from 'src/app/hooks'
import { TokenMap } from 'src/features/tokens/types'
import { NativeTokensByAddress } from 'src/tokens'

export function useTokens(): TokenMap {
  const customTokens = useAppSelector((s) => s.tokens.byAddress)
  return useMemo(() => ({ ...customTokens, ...NativeTokensByAddress }), [customTokens])
}

export function* selectTokens() {
  const customTokens = yield* appSelect((state) => state.tokens.byAddress)
  const merged: TokenMap = { ...customTokens, ...NativeTokensByAddress }
  return merged
}
