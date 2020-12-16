import { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { CELO_DERIVATION_PATH } from 'src/consts'
import { clearTransactions } from 'src/features/feed/feedSlice'
import { fetchFeedActions } from 'src/features/feed/fetch'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { setAddress } from 'src/features/wallet/walletSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { call, put, select } from 'typed-redux-saga'

function* importLedgerWallet(index: number) {
  const signer = yield* call(createLedgerSigner, index)

  const address = 'todo'

  const currentAddress = yield* select((state: RootState) => state.wallet.address)
  yield* put(setAddress(address))
  yield* put(fetchBalancesActions.trigger())

  // Only want to clear the feed if its not from the persisted/current wallet
  if (!currentAddress || currentAddress !== address) {
    yield* put(clearTransactions())
  }
  yield* put(fetchFeedActions.trigger())
}

async function createLedgerSigner(index: number) {
  const LedgerSigner = await dynamicImportLedgerSigner()

  // TODO dedupe with setSigner
  const provider = getProvider()
  if (!provider) {
    throw new Error('Provider must be set before signer')
  }

  const derivationPath = `${CELO_DERIVATION_PATH}/${index}`

  const signer = new LedgerSigner(provider, derivationPath)
}

async function dynamicImportLedgerSigner() {
  try {
    logger.info('Fetching Ledger bundle')
    const ledgerModule = await import('src/features/ledger/LedgerSigner')
    return ledgerModule.LedgerSigner
  } catch (error) {
    logger.error('Failed to load ledger bundle', error)
    throw new Error('Failure loading ledger bundle')
  }
}

export const {
  name: importLedgerWalletSagaName,
  wrappedSaga: importLedgerWalletSaga,
  actions: importLedgerWalletActions,
  reducer: importLedgerWalletReducer,
} = createMonitoredSaga<number>(importLedgerWallet, 'importLedgerWallet')
