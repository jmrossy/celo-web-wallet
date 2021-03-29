import { BigNumber, providers } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { signTransaction } from 'src/blockchain/transaction'
import { executeTxPlan, TxPlanExecutor, TxPlanItem } from 'src/blockchain/txPlan'
import { CeloContract } from 'src/config'
import { MIN_LOCKED_GOLD_TO_VOTE, MIN_VOTE_AMOUNT, NULL_ADDRESS } from 'src/consts'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { FeeEstimate } from 'src/features/fees/types'
import { validateFeeEstimates } from 'src/features/fees/utils'
import { StakeTokenTx, StakeTokenType, TransactionType } from 'src/features/types'
import {
  EligibleGroupsVotesRaw,
  GroupVotes,
  StakeActionType,
  StakeTokenParams,
  ValidatorGroup,
} from 'src/features/validators/types'
import { getStakingMaxAmount } from 'src/features/validators/utils'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import { getVoterAccountAddress, getVoterBalances } from 'src/features/wallet/utils'
import { CELO } from 'src/tokens'
import { areAddressesEqual } from 'src/utils/addresses'
import {
  BigNumberMin,
  getAdjustedAmount,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: StakeTokenParams,
  balances: Balances,
  voterBalances: Balances,
  groups: ValidatorGroup[],
  votes: GroupVotes,
  validateFee = false
): ErrorState {
  const { amountInWei, groupAddress, action, feeEstimates } = params
  let errors: ErrorState = { isValid: true }

  if (!groupAddress || groups.findIndex((g) => g.address === groupAddress) < 0) {
    errors = { ...errors, ...invalidInput('groupAddress', 'Invalid Validator Group') }
  }

  if (!Object.values(StakeActionType).includes(action)) {
    errors = { ...errors, ...invalidInput('action', 'Invalid Action Type') }
  }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const maxAmount = getStakingMaxAmount(params.action, voterBalances, votes, params.groupAddress)
    errors = {
      ...errors,
      ...validateAmount(amountInWei, CELO, null, maxAmount, MIN_VOTE_AMOUNT),
    }
  }

  // If locked amount is very small or 0
  if (
    action === StakeActionType.Vote &&
    BigNumber.from(voterBalances.lockedCelo.locked).lte(MIN_LOCKED_GOLD_TO_VOTE)
  ) {
    errors = { ...errors, ...invalidInput('lockedCelo', 'Insufficient locked CELO') }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimates(feeEstimates),
      ...validateAmountWithFees('0', CELO, balances, feeEstimates),
    }
  }

  return errors
}

function* stakeToken(params: StakeTokenParams) {
  const { action, amountInWei, feeEstimates } = params

  yield* call(fetchBalancesIfStale)
  const { balances, voterBalances } = yield* call(getVoterBalances)
  const voterAddress = yield* call(getVoterAccountAddress)
  const { validatorGroups, groupVotes } = yield* select((state: RootState) => state.validators)

  validateOrThrow(
    () => validate(params, balances, voterBalances, validatorGroups.groups, groupVotes, true),
    'Invalid transaction'
  )

  const txPlan = getStakeActionTxPlan(params, voterAddress, voterBalances, groupVotes)
  if (!feeEstimates || feeEstimates.length !== txPlan.length) {
    throw new Error('Fee estimates missing or do not match txPlan')
  }

  logger.info(`Executing ${action} for ${amountInWei} CELO`)
  yield* call<TxPlanExecutor<StakeTokenTxPlanItem>>(
    executeTxPlan,
    txPlan,
    feeEstimates,
    createActionTx,
    createPlaceholderTx,
    'stakeToken'
  )

  yield* put(fetchBalancesActions.trigger())
}

interface StakeTokenTxPlanItem extends TxPlanItem {
  type: StakeTokenType
  amountInWei: string
  groupAddress: string
  voterAddress: string
}

type StakeTokenTxPlan = Array<StakeTokenTxPlanItem>

// Stake token operations can require varying numbers of txs in specific order
// This determines the ideal tx types and order
export function getStakeActionTxPlan(
  params: StakeTokenParams,
  voterAddress: string,
  voterBalances: Balances,
  currentVotes: GroupVotes
): StakeTokenTxPlan {
  const { action, amountInWei, groupAddress } = params

  if (action === StakeActionType.Vote) {
    const maxAmount = getStakingMaxAmount(action, voterBalances, currentVotes, groupAddress)
    const adjutedAmount = getAdjustedAmount(amountInWei, maxAmount, CELO)
    return [
      {
        type: TransactionType.ValidatorVoteCelo,
        amountInWei: adjutedAmount.toString(),
        groupAddress,
        voterAddress,
      },
    ]
  } else if (action === StakeActionType.Activate) {
    return [
      { type: TransactionType.ValidatorActivateCelo, amountInWei, groupAddress, voterAddress },
    ]
  } else if (action === StakeActionType.Revoke) {
    const txs: StakeTokenTxPlan = []
    const groupVotes = currentVotes[groupAddress]
    let amountRemaining = BigNumber.from(amountInWei)
    const amountPending = BigNumber.from(groupVotes.pending)
    const amountActive = BigNumber.from(groupVotes.active)
    const pendingValue = BigNumberMin(amountPending, amountRemaining)
    const pendingAdjusted = getAdjustedAmount(amountRemaining, pendingValue, CELO)
    if (pendingValue.gt(0)) {
      txs.push({
        type: TransactionType.ValidatorRevokePendingCelo,
        amountInWei: pendingAdjusted.toString(),
        groupAddress,
        voterAddress,
      })
      amountRemaining = amountRemaining.sub(pendingAdjusted)
    }
    if (amountRemaining.gt(0)) {
      const activeAdjusted = getAdjustedAmount(amountRemaining, amountActive, CELO)
      txs.push({
        type: TransactionType.ValidatorRevokeActiveCelo,
        amountInWei: activeAdjusted.toString(),
        groupAddress,
        voterAddress,
      })
    }
    return txs
  } else {
    throw new Error(`Invalid stakeToken tx type: ${action}`)
  }
}

function createActionTx(txPlanItem: StakeTokenTxPlanItem, feeEstimate: FeeEstimate, nonce: number) {
  if (txPlanItem.type === TransactionType.ValidatorVoteCelo) {
    return createVoteTx(txPlanItem, feeEstimate, nonce)
  } else if (txPlanItem.type === TransactionType.ValidatorActivateCelo) {
    return createActivateTx(txPlanItem, feeEstimate, nonce)
  } else if (txPlanItem.type === TransactionType.ValidatorRevokeActiveCelo) {
    return createRevokeTx(txPlanItem, feeEstimate, nonce, false)
  } else if (txPlanItem.type === TransactionType.ValidatorRevokePendingCelo) {
    return createRevokeTx(txPlanItem, feeEstimate, nonce, true)
  } else {
    throw new Error(`Invalid tx type for stake request: ${txPlanItem.type}`)
  }
}

function createPlaceholderTx(
  txPlanItem: StakeTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  txReceipt: providers.TransactionReceipt
): StakeTokenTx {
  return {
    ...createPlaceholderForTx(txReceipt, txPlanItem.amountInWei, feeEstimate),
    type: txPlanItem.type,
    groupAddress: txPlanItem.groupAddress,
  }
}

async function createVoteTx(
  txPlanItem: StakeTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number
) {
  const { amountInWei: _amountInWei, groupAddress } = txPlanItem
  const amountInWei = BigNumber.from(_amountInWei)
  const election = getContract(CeloContract.Election)
  const { lesser, greater } = await findLesserAndGreaterAfterVote(groupAddress, amountInWei)
  const tx = await election.populateTransaction.vote(groupAddress, amountInWei, lesser, greater)
  tx.nonce = nonce
  logger.info('Signing validator vote tx')
  const signedTx = await signTransaction(tx, feeEstimate)
  return signedTx
}

async function createActivateTx(
  txPlanItem: StakeTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number
) {
  const election = getContract(CeloContract.Election)
  const tx = await election.populateTransaction.activate(txPlanItem.groupAddress)
  tx.nonce = nonce
  logger.info('Signing validator activation tx')
  const signedTx = await signTransaction(tx, feeEstimate)
  return signedTx
}

async function createRevokeTx(
  txPlanItem: StakeTokenTxPlanItem,
  feeEstimate: FeeEstimate,
  nonce: number,
  isForPending: boolean
) {
  const { amountInWei: _amountInWei, groupAddress, voterAddress } = txPlanItem
  const amountInWei = BigNumber.from(_amountInWei)
  const election = getContract(CeloContract.Election)
  const groupsVotedFor: string[] = await election.getGroupsVotedForByAccount(voterAddress)
  const groupIndex = groupsVotedFor.findIndex((g) => areAddressesEqual(g, groupAddress))
  const { lesser, greater } = await findLesserAndGreaterAfterVote(groupAddress, amountInWei.mul(-1))
  const contractMethod = isForPending
    ? election.populateTransaction.revokePending
    : election.populateTransaction.revokeActive
  const tx = await contractMethod(groupAddress, amountInWei, lesser, greater, groupIndex)
  tx.nonce = nonce
  logger.info(`Signing validator revoke tx, is for pending: ${isForPending}`)
  const signedTx = await signTransaction(tx, feeEstimate)
  return signedTx
}

async function findLesserAndGreaterAfterVote(
  targetGroup: string,
  voteWeight: BigNumber
): Promise<{ lesser: string; greater: string }> {
  const currentVotes = await getElegibleGroupVotes()
  const selectedGroup = currentVotes.find((votes) => areAddressesEqual(votes.address, targetGroup))
  const voteTotal = selectedGroup ? selectedGroup.votes.add(voteWeight) : voteWeight
  let greater = NULL_ADDRESS
  let lesser = NULL_ADDRESS

  // This leverages the fact that the currentVotes are already sorted from
  // greatest to lowest value
  for (const vote of currentVotes) {
    if (!areAddressesEqual(vote.address, targetGroup)) {
      if (vote.votes.lte(voteTotal)) {
        lesser = vote.address
        break
      }
      greater = vote.address
    }
  }

  return { lesser, greater }
}

async function getElegibleGroupVotes() {
  const election = getContract(CeloContract.Election)
  const currentVotes: EligibleGroupsVotesRaw = await election.getTotalVotesForEligibleValidatorGroups()
  const eligibleGroups = currentVotes[0]
  const groupVotes = currentVotes[1]
  const result = []
  for (let i = 0; i < eligibleGroups.length; i++) {
    result.push({
      address: eligibleGroups[i],
      votes: BigNumber.from(groupVotes[i]),
    })
  }
  return result
}

export const {
  name: stakeTokenSagaName,
  wrappedSaga: stakeTokenSaga,
  reducer: stakeTokenReducer,
  actions: stakeTokenActions,
} = createMonitoredSaga<StakeTokenParams>(stakeToken, 'stakeToken')
