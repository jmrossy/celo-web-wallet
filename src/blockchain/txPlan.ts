import { getCurrentNonce, sendSignedTransaction } from 'src/blockchain/transaction'
import { FeeEstimate } from 'src/features/fees/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TransactionType } from 'src/features/types'
import { logger } from 'src/utils/logger'
import { call, put } from 'typed-redux-saga'

export interface TxPlanItem {
  type: TransactionType
}

export type TxPlanExecutor<T extends TxPlanItem> = (
  txPlan: Array<T>,
  feeEstimates: FeeEstimate[],
  txCreator: (tx: T, feeEstimate: FeeEstimate, nonce: number) => Promise<string>,
  planName: string
) => void

// Utility for signing and sending a list of txs in order
export function* executeTxPlan<T extends TxPlanItem>(
  txPlan: Array<T>,
  feeEstimates: FeeEstimate[],
  txCreator: (tx: T, feeEstimate: FeeEstimate, nonce: number) => Promise<string>,
  planName: string
) {
  if (!txPlan.length || !feeEstimates.length || txPlan.length !== feeEstimates.length) {
    throw new Error('Invalid tx plan or fee estimates')
  }

  const signedTxs: string[] = []
  const currentNonce = yield* call(getCurrentNonce)

  for (let i = 0; i < txPlan.length; i++) {
    const tx = txPlan[i]
    const feeEstimate = feeEstimates[i]
    const signedTx = yield* call(txCreator, tx, feeEstimate, currentNonce + i)
    signedTxs.push(signedTx)
    yield* put(setNumSignatures(i + 1))
  }

  for (let i = 0; i < signedTxs.length; i++) {
    logger.info(`Sending ${planName} tx ${i + 1} of ${signedTxs.length}`)
    const txReceipt = yield* call(sendSignedTransaction, signedTxs[i])
    logger.info(`${planName} tx hash received: ${txReceipt.transactionHash}`)
    // TODO add placeholder txs
    // const placeholderTx = getPlaceholderTx(params, txReceipt, type)
    // yield* put(addPlaceholderTransaction(placeholderTx))
  }
}
