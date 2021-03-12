import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber } from 'ethers'
import { getSigner } from 'src/blockchain/signer'
import { TransactionType } from 'src/features/types'
import { NativeTokenId } from 'src/tokens'

const PRECOMPUTED_GAS_ESTIMATES: Partial<Record<TransactionType, number>> = {
  [TransactionType.StableTokenTransfer]: 95000,
  [TransactionType.StableTokenTransferWithComment]: 115000,
  [TransactionType.StableTokenApprove]: 95000,
  [TransactionType.CeloTokenTransfer]: 95000,
  [TransactionType.CeloTokenTransferWithComment]: 100000,
  [TransactionType.CeloTokenApprove]: 95000,
  [TransactionType.CeloNativeTransfer]: 40000,
  [TransactionType.TokenExchange]: 350000,
  [TransactionType.AccountRegistration]: 100000,
  [TransactionType.LockCelo]: 95000,
  [TransactionType.RelockCelo]: 150000,
  [TransactionType.UnlockCelo]: 260000,
  [TransactionType.WithdrawLockedCelo]: 210000,
  [TransactionType.ValidatorVoteCelo]: 480000,
  [TransactionType.ValidatorRevokeActiveCelo]: 310000,
  [TransactionType.ValidatorRevokePendingCelo]: 320000,
  [TransactionType.ValidatorActivateCelo]: 210000,
  [TransactionType.GovernanceVote]: 550000, //TODO
}

const STABLE_TOKEN_GAS_MULTIPLIER = 5

export async function estimateGas(
  type: TransactionType,
  tx?: CeloTransactionRequest,
  feeCurrency?: NativeTokenId,
  forceEstimation?: boolean
) {
  if (forceEstimation || !PRECOMPUTED_GAS_ESTIMATES[type]) {
    if (!tx) throw new Error('Tx must be provided when forcing gas estimation')
    return computeGasEstimate(tx, feeCurrency)
  }

  const gasLimit = BigNumber.from(PRECOMPUTED_GAS_ESTIMATES[type])
  if (!feeCurrency || feeCurrency === NativeTokenId.CELO) {
    return gasLimit
  } else if (feeCurrency === NativeTokenId.cUSD || feeCurrency === NativeTokenId.cEUR) {
    // TODO find a more scientific was to fix the gas estimation issue.
    // Since txs paid with cUSD also involve token transfers, the gas needed
    // is more than what estimateGas returns
    return gasLimit.mul(STABLE_TOKEN_GAS_MULTIPLIER)
  } else {
    throw new Error(`Unsupported fee currency ${feeCurrency}`)
  }
}

async function computeGasEstimate(tx: CeloTransactionRequest, feeCurrency?: NativeTokenId) {
  const signer = getSigner().signer
  const gasLimit = await signer.estimateGas(tx)

  if (!feeCurrency || feeCurrency === NativeTokenId.CELO) {
    return gasLimit
  } else if (feeCurrency === NativeTokenId.cUSD || feeCurrency === NativeTokenId.cEUR) {
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
//   const signer = getSigner().signer

//   const stableToken = getContract(CeloContract.StableToken)
//   const goldToken = getContract(CeloContract.GoldToken)
//   const exchange = getContract(CeloContract.Exchange)
//   const lockedGold = getContract(CeloContract.LockedGold)
//   const accounts = getContract(CeloContract.Accounts)

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

//   const createAccount = await signer.estimateGas(await accounts.populateTransaction.createAccount())
//   console.info('create account:' + createAccount.toString())

//   const lock = await signer.estimateGas(await lockedGold.populateTransaction.lock())
//   console.info('lock celo:' + lock.toString())
// }
