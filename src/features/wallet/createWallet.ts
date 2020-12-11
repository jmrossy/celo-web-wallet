import { entropyToMnemonic } from '@ethersproject/hdnode'
import { randomBytes } from '@ethersproject/random'
import { ethers } from 'ethers'
import { setSigner } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { createMonitoredSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { clearWallet, setAddress } from './walletSlice'

function* createWallet() {
  yield* put(clearWallet())
  const entropy = randomBytes(32)
  const mnemonic = entropyToMnemonic(entropy)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath)
  setSigner(wallet)
  yield* put(setAddress(wallet.address))
  yield* put(fetchBalancesActions.trigger())
  yield* put(clearTransactions())
}

export const {
  name: createWalletSagaName,
  wrappedSaga: createWalletSaga,
  reducer: createWalletReducer,
  actions: createWalletActions,
} = createMonitoredSaga(createWallet, 'createWallet')
