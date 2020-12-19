import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { utils, Wallet } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH, MNEMONIC_LENGTH } from 'src/consts'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetch'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { setAddress } from 'src/features/wallet/walletSlice'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'

export function* importWallet(mnemonic: string) {
  if (!isValidMnemonic(mnemonic)) throw new Error('Invalid mnemonic')

  const provider = getProvider()
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = Wallet.fromMnemonic(mnemonic.trim(), derivationPath)
  const celoWallet = new CeloWallet(wallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })

  yield* call(onWalletImport, celoWallet.address, SignerType.Local)
}

export function* onWalletImport(newAddress: string, type: SignerType) {
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  yield* put(setAddress({ address: newAddress, type }))
  yield* put(fetchBalancesActions.trigger())

  // Only want to clear the feed if its not from the persisted/current wallet
  if (!currentAddress || currentAddress !== newAddress) {
    yield* put(clearTransactions())
  }
  yield* put(fetchFeedActions.trigger())
}

export function isValidMnemonic(mnemonic: string) {
  return (
    mnemonic &&
    utils.isValidMnemonic(mnemonic.trim()) &&
    mnemonic.trim().split(' ').length === MNEMONIC_LENGTH
  )
}

export const {
  name: importWalletSagaName,
  wrappedSaga: importWalletSaga,
  actions: importWalletActions,
  reducer: importWalletReducer,
} = createMonitoredSaga<string>(importWallet, 'importWallet')

// Used for better dev experience, do not used in production
export function* importDefaultAccount() {
  if (!config.defaultAccount) return
  yield* call(importWallet, config.defaultAccount)
}
