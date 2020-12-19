import { BigNumber, BigNumberish } from 'ethers'
import { getProvider } from 'src/blockchain/provider'
import { setSigner, SignerType } from 'src/blockchain/signer'
import { CELO_DERIVATION_PATH, DERIVATION_PATH_MAX_INDEX } from 'src/consts'
import { onWalletImport } from 'src/features/wallet/importWallet'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, errorStateToString, invalidInput } from 'src/utils/validation'
import { call } from 'typed-redux-saga'

export interface ImportWalletParams {
  index: BigNumberish
}

export function validate(params: ImportWalletParams): ErrorState {
  const { index } = params

  if (index === null || index === undefined) {
    return invalidInput('index', 'Index is required')
  }

  const indexBn = BigNumber.from(index)
  if (indexBn.lt(0) || indexBn.gt(DERIVATION_PATH_MAX_INDEX)) {
    return invalidInput('index', 'Index value is invalid')
  }

  return { isValid: true }
}

function* importLedgerWallet(params: ImportWalletParams) {
  const validateResult = yield* call(validate, params)
  if (!validateResult.isValid) {
    throw new Error(errorStateToString(validateResult, 'Invalid Index'))
  }

  const signer = yield* call(createLedgerSigner, params)
  const address = signer.address
  if (!address) throw new Error('Ledger Signer missing address')
  setSigner({ signer, type: SignerType.Ledger })

  yield* call(onWalletImport, address, SignerType.Ledger)
}

async function createLedgerSigner(params: ImportWalletParams) {
  const { index } = params
  const LedgerSigner = await dynamicImportLedgerSigner()
  const provider = getProvider()
  const derivationPath = `${CELO_DERIVATION_PATH}/${index}`
  const signer = new LedgerSigner(provider, derivationPath)
  await signer.init()
  return signer
}

async function dynamicImportLedgerSigner() {
  try {
    logger.info('Fetching Ledger bundle')
    const global = window as any
    if (!global.Buffer) {
      const buffer = await import('buffer')
      global.Buffer = buffer.Buffer
    }
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
} = createMonitoredSaga<ImportWalletParams>(importLedgerWallet, 'importLedgerWallet')
