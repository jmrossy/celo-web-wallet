import { BigNumber } from 'ethers'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { NULL_ADDRESS } from 'src/consts'

export function useAreBalancesEmpty() {
  const { cUsd, celo } = useSelector((s: RootState) => s.wallet.balances)
  return BigNumber.from(cUsd).lte(0) && BigNumber.from(celo).lte(0)
}

export function useWalletAddress() {
  const address = useSelector((s: RootState) => s.wallet.address)
  return address || NULL_ADDRESS
}
