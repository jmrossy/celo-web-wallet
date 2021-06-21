import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { utils, Wallet } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { getSigner, setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { resetFeed } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetchFeed'
import { fetchBalancesActions } from 'src/features/wallet/balances/fetchBalances'
import { normalizeMnemonic } from 'src/features/wallet/utils'
import { clearWalletCache, setAddress } from 'src/features/wallet/walletSlice'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { put, select } from 'typed-redux-saga'

export function createRandomAccount() {
  try {
    const entropy = utils.randomBytes(32)
    const mnemonic = utils.entropyToMnemonic(entropy)
    const derivationPath = CELO_DERIVATION_PATH + '/0'
    const newAccount = Wallet.fromMnemonic(mnemonic, derivationPath)
    return { address: newAccount.address, mnemonic: newAccount.mnemonic.phrase, derivationPath }
  } catch (error) {
    logger.error('Error creating a random new account', error)
    return null
  }
}

export function* addAccount() {
  //TODO
}

export function* switchToAccount(address: string) {
  const mnemonic = 'TODO'
  const formattedMnemonic = normalizeMnemonic(mnemonic)
  const derivationPath = 'TODO'
  const type = SignerType.Local

  const provider = getProvider()
  const wallet = Wallet.fromMnemonic(formattedMnemonic, derivationPath)
  const celoWallet = new CeloWallet(wallet, provider)
  setSigner({ signer: celoWallet, type: SignerType.Local })
  // Grab the current address from the store (may have been loaded by persist)
  const currentAddress = yield* select((state: RootState) => state.wallet.address)

  yield* put(setAddress({ address, type, derivationPath }))
  yield* put(fetchBalancesActions.trigger())

  if (currentAddress && !areAddressesEqual(currentAddress, address)) {
    logger.debug('New address does not match current one in store')
    yield* put(clearWalletCache())
    yield* put(resetFeed())
  }
  yield* put(fetchFeedActions.trigger())
}

export function* removeAccount(address: string) {
  //TODO
}

export function getActiveAccount() {
  // TODO
  const signer = getSigner()
  const address = signer.signer.address
  if (!address)
    throw new Error('Signer address not set, may be a LedgerSigner not properly initialized')
  const mnemonic = signer.type === SignerType.Local ? signer.signer.mnemonic.phrase : undefined
  return { address, mnemonic, type: signer.type }
}
