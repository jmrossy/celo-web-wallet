import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { Currency } from 'src/consts'
import { TransactionType } from 'src/features/types'

// TODO compute more accurate gas estimates
const PRECOMPUTED_GAS_ESTIMATES: Partial<Record<TransactionType, number>> = {
  [TransactionType.StableTokenTransfer]: 200000,
  [TransactionType.StableTokenTransferWithComment]: 200000,
  [TransactionType.StableTokenApprove]: 200000,
  [TransactionType.CeloTokenTransfer]: 200000,
  [TransactionType.CeloTokenTransferWithComment]: 200000,
  [TransactionType.CeloTokenApprove]: 200000,
  [TransactionType.CeloNativeTransfer]: 200000,
  [TransactionType.TokenExchange]: 200000,
}

const STABLE_TOKEN_GAS_MULTIPLIER = 10

export async function estimateGas(
  type: TransactionType,
  tx?: CeloTransactionRequest,
  feeCurrency?: Currency,
  forceEstimation?: boolean
) {
  if (forceEstimation || !PRECOMPUTED_GAS_ESTIMATES[type]) {
    if (!tx) throw new Error('Tx must be provided when forcing gas estimation')
    return computeGasEstimate(tx, feeCurrency)
  }

  return BigNumber.from(PRECOMPUTED_GAS_ESTIMATES[type])
}

async function computeGasEstimate(tx: CeloTransactionRequest, feeCurrency?: Currency) {
  const signer = getSigner()
  const gasLimit = await signer.estimateGas(tx)

  if (!feeCurrency || feeCurrency === Currency.CELO) {
    return gasLimit
  } else if (feeCurrency === Currency.cUSD) {
    // TODO find a more scientific was to fix the gas estimation issue.
    // Since txs paid with cUSD also involve token transfers, the gas needed
    // is more than what estimateGas returns
    return gasLimit.mul(STABLE_TOKEN_GAS_MULTIPLIER)
  } else {
    throw new Error(`Unsupported fee currency ${feeCurrency}`)
  }
}
