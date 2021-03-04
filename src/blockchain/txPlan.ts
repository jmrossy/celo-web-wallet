import { providers } from 'ethers'
import { getCurrentNonce, sendSignedTransaction } from 'src/blockchain/transaction'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { FeeEstimate } from 'src/features/fees/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { CeloTransaction, TransactionType } from 'src/features/types'
import { logger } from 'src/utils/logger'
import { call, put } from 'typed-redux-saga'

export interface TxPlanItem {
  type: TransactionType
}

export type TxPlanExecutor<T extends TxPlanItem> = (
  txPlan: Array<T>,
  feeEstimates: FeeEstimate[],
  txCreator: (tx: T, feeEstimate: FeeEstimate, nonce: number) => Promise<string>,
  placeholderTxCreator: (
    tx: T,
    feeEstimate: FeeEstimate,
    txReceipt: providers.TransactionReceipt
  ) => CeloTransaction,
  planName: string
) => void

// Utility for signing and sending a list of txs in order
export function* executeTxPlan<T extends TxPlanItem>(
  txPlan: Array<T>,
  feeEstimates: FeeEstimate[],
  txCreator: (tx: T, feeEstimate: FeeEstimate, nonce: number) => Promise<string>,
  placeholderTxCreator: (
    tx: T,
    feeEstimate: FeeEstimate,
    txReceipt: providers.TransactionReceipt
  ) => CeloTransaction,
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
    const txPlanItem = txPlan[i]
    const feeEstimate = feeEstimates[i]
    logger.info(`Sending ${planName} tx ${i + 1} of ${signedTxs.length}`)
    const txReceipt = yield* call(sendSignedTransaction, signedTxs[i])
    logger.info(`${planName} tx hash received: ${txReceipt.transactionHash}`)
    const placeholderTx = placeholderTxCreator(txPlanItem, feeEstimate, txReceipt)
    if (placeholderTx) yield* put(addPlaceholderTransaction(placeholderTx))
  }
}
