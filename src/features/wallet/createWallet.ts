import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { entropyToMnemonic } from '@ethersproject/hdnode'
import { randomBytes } from '@ethersproject/random'
import { ethers } from 'ethers'
import { clearContractCache } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { createMonitoredSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { clearWallet, setAddress } from './walletSlice'

function* createWallet() {
  yield* put(clearWallet())
  yield* put(clearTransactions())
  clearContractCache()

  const provider = getProvider()
  const entropy = randomBytes(32)
  const mnemonic = entropyToMnemonic(entropy)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath)
  const celoWallet = new CeloWallet(wallet, provider)

  setSigner({ signer: celoWallet, type: SignerType.Local })
  yield* put(setAddress({ address: celoWallet.address, type: SignerType.Local }))
  yield* put(fetchBalancesActions.trigger())
}

export const {
  name: createWalletSagaName,
  wrappedSaga: createWalletSaga,
  reducer: createWalletReducer,
  actions: createWalletActions,
} = createMonitoredSaga(createWallet, 'createWallet')
