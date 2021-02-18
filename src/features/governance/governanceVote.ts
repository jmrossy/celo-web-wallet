import { getContract } from 'src/blockchain/contracts'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { GovernanceVoteParams, VoteValue } from 'src/features/governance/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put } from 'typed-redux-saga'

export function validate(
  params: GovernanceVoteParams,
  balances: Balances,
  validateFee = false
): ErrorState {
  const { proposalId, value, feeEstimate } = params
  let errors: ErrorState = { isValid: true }

  if (!Object.values(VoteValue).includes(value)) {
    errors = { ...errors, ...invalidInput('value', 'Invalid Vote Value') }
  }

  // TODO validate proposal

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimate),
      // TODO ensure user has some locked balance
      // ...validateAmountWithFees(
      //   amountInWei,
      //   currency,
      //   balances,
      //   feeEstimate ? [feeEstimate] : undefined
      // ),
    }
  }

  return errors
}

function* governanceVote(params: GovernanceVoteParams) {
  const balances = yield* call(fetchBalancesIfStale)

  validateOrThrow(() => validate(params, balances, true), 'Invalid transaction')

  const signedTx = yield* call(createVoteTx, params, balances)
  yield* put(setNumSignatures(1))

  const txReceipt = yield* call(sendSignedTransaction, signedTx)
  logger.info(`Govervance vote hash received: ${txReceipt.transactionHash}`)

  // TODO
  // const placeholderTx = getPlaceholderTx(params, txReceipt, type)
  // yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createVoteTx(params: GovernanceVoteParams, balances: Balances) {
  const { proposalId, value, feeEstimate } = params
  if (!feeEstimate) throw new Error('Fee estimate is missing')

  const governance = getContract(CeloContract.Governance)
  const tx = await governance.populateTransaction
    .vote
    //TODO
    ()

  logger.info('Signing governance vote tx')
  const signedTx = await signTransaction(tx, feeEstimate)
  return signedTx
}

export const {
  name: governanceVoteSagaName,
  wrappedSaga: governanceVoteSaga,
  reducer: governanceVoteReducer,
  actions: governanceVoteActions,
} = createMonitoredSaga<GovernanceVoteParams>(governanceVote, 'governanceVote')
