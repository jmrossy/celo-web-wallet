import { BigNumber } from 'ethers'
import { Balances } from 'src/features/wallet/types'
import { NativeTokenId } from 'src/tokens'

// Decide which order to try gas fee payments in
// Putting this in a separate file for now to facilitate testing
export function resolveTokenPreferenceOrder(
  balances: Balances,
  preferredToken: NativeTokenId = NativeTokenId.CELO,
  txToken?: NativeTokenId
) {
  const nativeTokenSet = new Set(Object.keys(NativeTokenId))

  const tokenBal = balances.tokens
  const sortedTokens = Object.values(tokenBal).sort((t1, t2) => {
    const t1Value = BigNumber.from(t1.value)
    const t2Value = BigNumber.from(t2.value)
    if (t1Value.gt(t2Value)) return -1
    if (t1Value.lt(t2Value)) return 1
    if (t1.id === preferredToken) return -1
    if (t2.id === preferredToken) return 1
    if (t1.id === txToken) return -1
    if (t2.id === txToken) return 1
    const t1Sort = t1.sortOrder ?? 1000
    const t2Sort = t2.sortOrder ?? 1000
    if (t1Sort < t2Sort) return -1
    if (t1Sort > t2Sort) return 1
    return t1.id < t2.id ? -1 : 1
  })

  const order: NativeTokenId[] = []
  // Preferred is first choice if it has balance
  if (BigNumber.from(tokenBal[preferredToken].value).gt(0)) {
    order.push(preferredToken)
    nativeTokenSet.delete(preferredToken)
  }
  // txToken is 2nd choice if it has balance
  if (txToken && txToken !== preferredToken && BigNumber.from(tokenBal[txToken].value).gt(0)) {
    order.push(txToken)
    nativeTokenSet.delete(txToken)
  }

  // Go through sorted tokens and add in any not yet included
  for (const t of sortedTokens) {
    if (nativeTokenSet.has(t.id)) {
      order.push(t.id as NativeTokenId)
      nativeTokenSet.delete(t.id)
    }
  }

  return order
}
