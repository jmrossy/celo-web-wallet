import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { utils, Wallet } from 'ethers'
import { clearContractCache } from 'src/blockchain/contracts'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { createMonitoredSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'
import { resetWallet, setAddress } from './walletSlice'

// TODO remove
function* createWallet() {
  yield* put(resetWallet())
  yield* put(resetFeed())
  clearContractCache()

  const provider = getProvider()
  const entropy = utils.randomBytes(32)
  const mnemonic = utils.entropyToMnemonic(entropy)
  const derivationPath = CELO_DERIVATION_PATH + '/0'
  const wallet = Wallet.fromMnemonic(mnemonic, derivationPath)
  const celoWallet = new CeloWallet(wallet, provider)

  setSigner({ signer: celoWallet, type: SignerType.Local })
  yield* put(setAddress({ address: celoWallet.address, type: SignerType.Local, derivationPath }))
  yield* put(fetchBalancesActions.trigger())
}

export const {
  name: createWalletSagaName,
  wrappedSaga: createWalletSaga,
  reducer: createWalletReducer,
  actions: createWalletActions,
} = createMonitoredSaga(createWallet, 'createWallet')
