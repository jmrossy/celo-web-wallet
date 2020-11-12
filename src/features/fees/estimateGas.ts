import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { Currency } from 'src/consts'
import { TransactionType } from 'src/features/types'

const PRECOMPUTED_GAS_ESTIMATES: Partial<Record<TransactionType, number>> = {
  [TransactionType.StableTokenTransfer]: 50000,
  [TransactionType.StableTokenTransferWithComment]: 66000,
  [TransactionType.StableTokenApprove]: 52000,
  [TransactionType.CeloTokenTransfer]: 50000,
  [TransactionType.CeloTokenTransferWithComment]: 66000,
  [TransactionType.CeloTokenApprove]: 52000,
  [TransactionType.CeloNativeTransfer]: 25000,
  [TransactionType.TokenExchange]: 300000,
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

// Do not use in production
// Kept for convinence to compute the consts above
// export async function precomputeGasEstimates() {
//   const signer = getSigner()

//   const stableToken = await getContract(CeloContract.StableToken)
//   const goldToken = await getContract(CeloContract.GoldToken)
//   const exchange = await getContract(CeloContract.Exchange)

//   let comment = ''
//   for (let i = 0; i < MAX_COMMENT_CHAR_LENGTH; i++) {
//     comment += 'a'
//   }
//   const value = BigNumber.from('1000000000000000000')

//   const sT = await signer.estimateGas(
//     await stableToken.populateTransaction.transfer(TEST_ADDRESS, value)
//   )
//   logger.info('stable transfer:' + sT.toString())

//   const sTwC = await signer.estimateGas(
//     await stableToken.populateTransaction.transferWithComment(TEST_ADDRESS, value, comment)
//   )
//   logger.info('stable transfer with comment:' + sTwC.toString())

//   const sA = await signer.estimateGas(
//     await stableToken.populateTransaction.approve(TEST_ADDRESS, value)
//   )
//   logger.info('stable approve:' + sA.toString())

//   const gT = await signer.estimateGas(
//     await goldToken.populateTransaction.transfer(TEST_ADDRESS, value)
//   )
//   logger.info('gold transfer:' + gT.toString())

//   const gTwC = await signer.estimateGas(
//     await goldToken.populateTransaction.transferWithComment(TEST_ADDRESS, value, comment)
//   )
//   logger.info('gold transfer with comment:' + gTwC.toString())

//   const gA = await signer.estimateGas(
//     await goldToken.populateTransaction.approve(TEST_ADDRESS, value)
//   )
//   logger.info('gold approve:' + gA.toString())

//   const gN = await signer.estimateGas({ to: TEST_ADDRESS, value: value })
//   logger.info('gold native transfer:' + gN.toString())

//   const txResponse = await goldToken.approve(exchange.address, value)
//   await txResponse.wait()
//   const ex = await signer.estimateGas(await exchange.populateTransaction.exchange(value, 10, true))
//   logger.info('token exchange:' + ex.toString())
// }
