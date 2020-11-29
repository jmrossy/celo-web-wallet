import { BigNumber } from 'ethers'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'

export function useAreBalancesEmpty() {
  const { cUsd, celo } = useSelector((s: RootState) => s.wallet.balances)
  return BigNumber.from(cUsd).lte(0) && BigNumber.from(celo).lte(0)
}
