import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { fetchBalancesActions } from 'src/features/wallet/fetchBalances'
import { WalletConnectParams } from 'src/features/walletConnect/types'
import { createMonitoredSaga } from 'src/utils/saga'
import { put } from 'typed-redux-saga'

function* sendWalletConnectTx(params: WalletConnectParams) {
  // validateOrThrow(() => validate(params, balances, txSizeLimitEnabled, true), 'Invalid transaction')

  // const { signedTx, type, token } = yield* call(createSendTx, params, balances)
  // yield* put(setNumSignatures(1))

  // const txReceipt = yield* call(sendSignedTransaction, signedTx)
  // logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  // const placeholderTx = getPlaceholderTx(params, token, type, txReceipt)
  // yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

export async function createWalletConnectTxRequest(params: WalletConnectParams) {
  // TODO
  return {
    to: params.data.to,
    value: '0',
  } as CeloTransactionRequest
}

export const {
  name: sendWalletConnectTxSagaName,
  wrappedSaga: sendWalletConnectTxSaga,
  reducer: sendWalletConnectTxReducer,
  actions: sendWalletConnectTxActions,
} = createMonitoredSaga<WalletConnectParams>(sendWalletConnectTx, 'sendWalletConnectTx')
