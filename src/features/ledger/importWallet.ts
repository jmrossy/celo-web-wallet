import { BigNumber, BigNumberish } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH, DERIVATION_PATH_MAX_INDEX } from 'src/consts'
import { LedgerSigner } from 'src/features/ledger/LedgerSigner'
import { onWalletImport } from 'src/features/wallet/importWallet'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { areAddressesEqual } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, errorStateToString, invalidInput } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export interface ImportWalletParams {
  index?: BigNumberish
  useExisting?: boolean
}

export function validate(params: ImportWalletParams): ErrorState {
  const { index, useExisting } = params

  if (useExisting) return { isValid: true }

  if (index === null || index === undefined) {
    return invalidInput('index', 'Index required')
  }

  const indexBn = BigNumber.from(index)
  if (indexBn.lt(0) || indexBn.gt(DERIVATION_PATH_MAX_INDEX)) {
    return invalidInput('index', 'Invalid index')
  }

  return { isValid: true }
}

function* importLedgerWallet(params: ImportWalletParams) {
  const validateResult = yield* call(validate, params)
  if (!validateResult.isValid) {
    throw new Error(errorStateToString(validateResult, 'Invalid Index'))
  }

  const { index, useExisting } = params
  let signer: LedgerSigner
  let derivationPath: string
  if (useExisting) {
    const wallet = yield* call(importExistingLedgerWallet)
    derivationPath = wallet.derivationPath
    signer = wallet.signer
  } else {
    derivationPath = `${CELO_DERIVATION_PATH}/${index}`
    signer = yield* call(createLedgerSigner, derivationPath)
  }

  const address = signer.address
  if (!address) throw new Error('Ledger Signer missing address')
  setSigner({ signer, type: SignerType.Ledger })

  yield* call(onWalletImport, address, SignerType.Ledger, derivationPath)
  yield* put(setWalletUnlocked(true))
}

function* importExistingLedgerWallet() {
  const { address, derivationPath, type } = yield* select((state: RootState) => state.wallet)

  if (!address || !derivationPath || !type) throw new Error('No current wallet info found')
  if (type !== SignerType.Ledger) throw new Error('Current wallet is not Ledger based')

  const signer = yield* call(createLedgerSigner, derivationPath)
  const newAddress = signer.address
  if (!newAddress) throw new Error('Ledger Signer missing address')
  if (!areAddressesEqual(newAddress, address))
    throw new Error(
      'Ledger address does not match current wallet. Please ensure you are using the right Ledger.'
    )
  return { signer, derivationPath }
}

async function createLedgerSigner(derivationPath: string) {
  const LedgerSigner = await dynamicImportLedgerSigner()
  const provider = getProvider()
  const signer = new LedgerSigner(provider, derivationPath)
  await signer.init()
  return signer
}

async function dynamicImportLedgerSigner() {
  try {
    logger.debug('Fetching Ledger bundle')
    const ledgerModule = await import(
      /* webpackChunkName: "ledger" */ 'src/features/ledger/LedgerSigner'
    )
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
} = createMonitoredSaga<ImportWalletParams>(importLedgerWallet, 'importLedgerWallet')
