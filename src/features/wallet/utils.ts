import { BigNumber, utils } from 'ethers'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { MNEMONIC_LENGTH_MAX, MNEMONIC_LENGTH_MIN, NULL_ADDRESS } from 'src/consts'
import { Currency } from 'src/currency'
import { Balances } from 'src/features/wallet/types'
import { select } from 'typed-redux-saga'

export function useAreBalancesEmpty() {
  const { cUsd, celo } = useSelector((s: RootState) => s.wallet.balances)
  return BigNumber.from(cUsd).lte(0) && BigNumber.from(celo).lte(0)
}

export function useWalletAddress() {
  const address = useSelector((s: RootState) => s.wallet.address)
  return address || NULL_ADDRESS
}

export function* getVoterAccountAddress() {
  const { address, account } = yield* select((state: RootState) => state.wallet)
  if (!address || !account.lastUpdated)
    throw new Error('Attempting to select vote signer before wallet is initialized')
  return account.voteSignerFor ?? address
}

export function getCurrencyBalance(balances: Balances, currency: Currency) {
  if (!balances) throw new Error('No balances provided')
  if (currency === Currency.CELO) return balances.celo
  if (currency === Currency.cUSD) return balances.cUsd
  throw new Error(`Unsupported currency ${currency}`)
}

export function isValidMnemonic(mnemonic: string) {
  if (!mnemonic) return false
  const trimmed = mnemonic.trim()
  const split = trimmed.split(' ')
  return (
    utils.isValidMnemonic(trimmed) &&
    split.length >= MNEMONIC_LENGTH_MIN &&
    split.length <= MNEMONIC_LENGTH_MAX
  )
}

export function isValidDerivationPath(derivationPath: string) {
  if (!derivationPath) return false
  const split = derivationPath.trim().split('/')
  // TODO validate each path segment individually here
  return split[0] === 'm' && split.length === 6
}
