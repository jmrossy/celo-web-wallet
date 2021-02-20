import { BigNumber } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import { WEI_PER_UNIT } from 'src/consts'
import { Currency } from 'src/currency'
import { validateFeeEstimate } from 'src/features/fees/utils'
import {
  GovernanceVoteParams,
  Proposal,
  ProposalStage,
  VoteValue,
} from 'src/features/governance/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { validateAmountWithFees } from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: GovernanceVoteParams,
  balances: Balances,
  proposals: Proposal[],
  validateFee = false
): ErrorState {
  const { proposalId, value, feeEstimate } = params
  let errors: ErrorState = { isValid: true }

  if (!proposalId) {
    errors = { ...errors, ...invalidInput('proposalId', 'No proposal selected') }
  } else {
    const selected = proposals.find((p) => p.id === proposalId)
    if (!selected || selected.stage !== ProposalStage.Referendum) {
      errors = { ...errors, ...invalidInput('proposalId', 'Invalid Proposal Selection') }
    }
  }

  if (!Object.values(VoteValue).includes(value)) {
    errors = { ...errors, ...invalidInput('value', 'Invalid vote value') }
  }

  // If locked is less than 1 CELO
  if (BigNumber.from(balances.lockedCelo.locked).lte(WEI_PER_UNIT)) {
    errors = { ...errors, ...invalidInput('lockedCelo', 'Insufficient locked CELO') }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimate),
      ...validateAmountWithFees(
        '0',
        Currency.CELO,
        balances,
        feeEstimate ? [feeEstimate] : undefined
      ),
    }
  }

  return errors
}

function* governanceVote(params: GovernanceVoteParams) {
  const balances = yield* call(fetchBalancesIfStale)
  const proposals = yield* select((state: RootState) => state.governance.proposals)

  validateOrThrow(() => validate(params, balances, proposals, true), 'Invalid transaction')

  const signedTx = yield* call(createVoteTx, params)
  yield* put(setNumSignatures(1))

  const txReceipt = yield* call(sendSignedTransaction, signedTx)
  logger.info(`Govervance vote hash received: ${txReceipt.transactionHash}`)

  // TODO
  // const placeholderTx = getPlaceholderTx(params, txReceipt, type)
  // yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createVoteTx(params: GovernanceVoteParams) {
  const { proposalId, value, feeEstimate } = params
  if (!feeEstimate) throw new Error('Fee estimate is missing')

  const governance = getContract(CeloContract.Governance)

  const dequeued: string[] = await governance.getDequeue()
  const propsalIndex = dequeued.findIndex((d) => d === proposalId)
  if (propsalIndex < 0) throw new Error('Proposal not found in dequeued list')

  const tx = await governance.populateTransaction.vote(proposalId, propsalIndex, value)
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
