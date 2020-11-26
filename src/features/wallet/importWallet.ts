import { utils, Wallet } from 'ethers'
import { setSigner } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetch'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { createMonitoredSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { setAddress } from './walletSlice'

const MNEMONIC_LENGTH = 24

export function* importWallet(mnemonic: string) {
  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic')
  }

  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = Wallet.fromMnemonic(mnemonic.trim(), derivationPath)
  setSigner(wallet)
  yield* put(setAddress(wallet.address))
  yield* put(fetchBalancesActions.trigger())
  yield* put(clearTransactions())
  yield* put(fetchFeedActions.trigger())
}

export function isValidMnemonic(mnemonic: string) {
  return (
    mnemonic &&
    utils.isValidMnemonic(mnemonic) &&
    mnemonic.trim().split(' ').length === MNEMONIC_LENGTH
  )
}

export const {
  wrappedSaga: importWalletSaga,
  actions: importWalletActions,
  reducer: importWalletReducer,
} = createMonitoredSaga<string>(importWallet, 'importWallet')
