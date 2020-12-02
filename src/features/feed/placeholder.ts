import { providers } from 'ethers'
import { FeeEstimate } from 'src/features/fees/types'
import { CeloTransaction, TransactionType } from 'src/features/types'

export function createPlaceholderForTx(
  txReceipt: providers.TransactionReceipt,
  value: string,
  feeEstimate: FeeEstimate
): CeloTransaction {
  return {
    type: TransactionType.Other,
    hash: txReceipt.transactionHash,
    from: txReceipt.from,
    to: txReceipt.to,
    value: value,
    blockNumber: txReceipt.blockNumber,
    nonce: 0,
    timestamp: Date.now(),
    gasPrice: feeEstimate.gasPrice,
    gasUsed: txReceipt.gasUsed.toString(),
    feeToken: feeEstimate.currency,
    gatewayFee: undefined, // TODO
    gatewayFeeRecipient: undefined, // TODO
  }
}
