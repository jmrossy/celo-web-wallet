import { BigNumber } from 'ethers'
import { TokenBalances } from 'src/features/balances/types'
import { CELO, NativeTokens } from 'src/tokens'

// Decide which order to try gas fee payments in
// Putting this in a separate file for now to facilitate testing
export function resolveTokenPreferenceOrder(
  tokenBalances: TokenBalances,
  preferredToken: Address = CELO.address,
  txToken?: Address
) {
  const nativeTokenSet = new Set<Address>(NativeTokens.map((t) => t.address))

  const sortedTokens = Object.values(tokenBalances).sort((t1, t2) => {
    const t1Value = BigNumber.from(t1.value)
    const t2Value = BigNumber.from(t2.value)
    if (t1Value.gt(t2Value)) return -1
    if (t1Value.lt(t2Value)) return 1
    if (t1.address === preferredToken) return -1
    if (t2.address === preferredToken) return 1
    if (t1.address === txToken) return -1
    if (t2.address === txToken) return 1
    const t1Sort = t1.sortOrder ?? 1000
    const t2Sort = t2.sortOrder ?? 1000
    if (t1Sort < t2Sort) return -1
    if (t1Sort > t2Sort) return 1
    return t1.symbol < t2.symbol ? -1 : 1
  })

  const order: Address[] = []
  // Preferred is first choice if it has balance
  if (BigNumber.from(tokenBalances[preferredToken]?.value ?? 0).gt(0)) {
    order.push(preferredToken)
    nativeTokenSet.delete(preferredToken)
  }
  // txToken is 2nd choice if it has balance
  if (
    txToken &&
    txToken !== preferredToken &&
    BigNumber.from(tokenBalances[txToken]?.value ?? 0).gt(0)
  ) {
    order.push(txToken)
    nativeTokenSet.delete(txToken)
  }

  // Go through sorted tokens and add in any not yet included
  for (const t of sortedTokens) {
    if (nativeTokenSet.has(t.address)) {
      order.push(t.address)
      nativeTokenSet.delete(t.address)
    }
  }

  return order
}
