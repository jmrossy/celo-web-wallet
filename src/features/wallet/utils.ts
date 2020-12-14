import { BigNumber } from 'ethers'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Currency, NULL_ADDRESS } from 'src/consts'
import { Balances } from 'src/features/wallet/types'

export function useAreBalancesEmpty() {
  const { cUsd, celo } = useSelector((s: RootState) => s.wallet.balances)
  return BigNumber.from(cUsd).lte(0) && BigNumber.from(celo).lte(0)
}

export function useWalletAddress() {
  const address = useSelector((s: RootState) => s.wallet.address)
  return address || NULL_ADDRESS
}

export function getCurrencyBalance(balances: Balances, currency: Currency) {
  if (!balances) throw new Error('No balances provided')
  if (currency === Currency.CELO) return balances.celo
  if (currency === Currency.cUSD) return balances.cUsd
  throw new Error(`Unsupported currency ${currency}`)
}
