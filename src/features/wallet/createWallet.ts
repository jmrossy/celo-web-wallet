import { entropyToMnemonic } from '@ethersproject/hdnode'
import { randomBytes } from '@ethersproject/random'
import { ethers } from 'ethers'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { createMonitoredSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { setAddress } from './walletSlice'

function* createWallet() {
  const entropy = randomBytes(32)
  const mnemonic = entropyToMnemonic(entropy)
  console.log(mnemonic)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath)
  yield* put(setAddress(wallet.address))
}

export const {
  wrappedSaga: createWalletSaga,
  reducer: createWalletReducer,
  actions: createWalletActions,
} = createMonitoredSaga(createWallet, { name: 'createWallet' })
