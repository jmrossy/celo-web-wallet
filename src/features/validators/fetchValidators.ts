import { BigNumber, BigNumberish } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { batchCall } from 'src/blockchain/batchCall'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import {
  MAX_NUM_ELECTABLE_VALIDATORS,
  NULL_ADDRESS,
  VALIDATOR_LIST_STALE_TIME,
  VALIDATOR_VOTES_STALE_TIME,
} from 'src/consts'
import {
  EligibleGroupsVotesRaw,
  Validator,
  ValidatorGroup,
  ValidatorStatus,
} from 'src/features/validators/types'
import { updateValidatorGroups } from 'src/features/validators/validatorsSlice'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

interface ValidatorRaw {
  ecdsaPublicKey: string
  blsPublicKey: string
  affiliation: string
  score: BigNumberish
  signer: string
}

interface FetchValidatorsParams {
  force?: boolean
}

function* fetchValidators({ force }: FetchValidatorsParams) {
  const { groups, lastUpdated } = yield* select(
    (state: RootState) => state.validators.validatorGroups
  )

  if (force || !groups.length || !lastUpdated || isStale(lastUpdated, VALIDATOR_LIST_STALE_TIME)) {
    const validatorGroups = yield* call(fetchValidatorGroupInfo)
    yield* put(updateValidatorGroups({ groups: validatorGroups, lastUpdated: Date.now() }))
  } else if (isStale(lastUpdated, VALIDATOR_VOTES_STALE_TIME)) {
    const updatedGroups = yield* call(fetchValidatorGroupVotes, groups)
    yield* put(updateValidatorGroups({ groups: updatedGroups, lastUpdated: Date.now() }))
  }
}

async function fetchValidatorGroupInfo() {
  // Get contracts
  const accounts = getContract(CeloContract.Accounts)
  const validators = getContract(CeloContract.Validators)
  const election = getContract(CeloContract.Election)

  // Fetch list of validators and list of elected signers
  const validatorAddrsP: Promise<string[]> = validators.getRegisteredValidators()
  const electedSignersP: Promise<string[]> = election.getCurrentValidatorSigners()
  const [validatorAddrs, electedSigners] = await Promise.all([validatorAddrsP, electedSignersP])
  if (!validatorAddrs || !validatorAddrs.length) {
    throw new Error('No registered validators found')
  }
  if (!electedSigners || !electedSigners.length) {
    throw new Error('No elected signers found')
  }
  const electedSignersSet = new Set<string>(electedSigners)

  // Fetch validator details, needed for their scores and signers
  const validatorDetails: ValidatorRaw[] = await batchCall(
    validators,
    'getValidator',
    validatorAddrs,
    200
  )
  const validatorNames: string[] = await batchCall(accounts, 'getName', validatorAddrs, 200)

  if (
    validatorAddrs.length !== validatorDetails.length ||
    validatorAddrs.length !== validatorNames.length
  ) {
    throw new Error('Validator list / details size mismatch')
  }

  // Process validator lists to create list of validator groups
  const groups: Record<string, ValidatorGroup> = {}
  for (let i = 0; i < validatorAddrs.length; i++) {
    const valAddr = validatorAddrs[i]
    const valDetails = validatorDetails[i]
    const valName = validatorNames[i]
    const groupAddr = valDetails.affiliation
    // Create new group if there isn't one yet
    if (!groups[groupAddr]) {
      groups[groupAddr] = {
        address: groupAddr,
        name: '',
        url: '',
        members: {},
        eligible: false,
        capacity: '0',
        votes: '0',
      }
    }
    // Create new validator group member
    const validatorStatus = electedSignersSet.has(valDetails.signer)
      ? ValidatorStatus.Elected
      : ValidatorStatus.NotElected
    const validator: Validator = {
      address: valAddr,
      name: valName,
      score: BigNumber.from(valDetails.score).toString(),
      signer: valDetails.signer,
      status: validatorStatus,
    }
    groups[groupAddr].members[valAddr] = validator
  }

  // Remove 'null' group with unaffiliated validators
  if (groups[NULL_ADDRESS]) {
    delete groups[NULL_ADDRESS]
  }

  // Fetch details about the validator groups
  const groupAddrs = Object.keys(groups)
  const groupNames: string[] = await batchCall(accounts, 'getName', groupAddrs, 200)
  // Skipping URL retrieval for now, may revisit this later
  // const groupUrls: string[] = await batchCall(accounts, 'getMetadataURL',groupAddrs,  200)
  if (groupAddrs.length !== groupNames.length) {
    throw new Error('Group list / details size mismatch')
  }

  // Process details about the validator groups
  for (let i = 0; i < groupAddrs.length; i++) {
    const groupAddr = groupAddrs[i]
    const name = groupNames[i]
    groups[groupAddr].name = name
  }

  // Fetch vote-related details about the validator groups
  const { eligibleGroups, groupVotes, totalLocked } = await fetchVotesAndTotalLocked()

  // Process vote-related details about the validator groups
  for (let i = 0; i < eligibleGroups.length; i++) {
    const groupAddr = eligibleGroups[i]
    const numVotes = groupVotes[i]
    const group = groups[groupAddr]
    group.eligible = true
    group.capacity = getValidatorGroupCapacity(group, validatorAddrs.length, totalLocked)
    group.votes = numVotes.toString()
  }

  return Object.values(groups)
}

// Just fetch latest vote counts, not the entire groups + validators info set
async function fetchValidatorGroupVotes(groups: ValidatorGroup[]) {
  let totalValidators = groups.reduce((total, g) => total + Object.keys(g.members).length, 0)
  // Only bother to fetch actual num validators on the off chance there are fewer members than MAX
  if (totalValidators < MAX_NUM_ELECTABLE_VALIDATORS) {
    const validators = getContract(CeloContract.Validators)
    const validatorAddrs: string[] = await validators.getRegisteredValidators()
    totalValidators = validatorAddrs.length
  }

  // Fetch vote-related details about the validator groups
  const { eligibleGroups, groupVotes, totalLocked } = await fetchVotesAndTotalLocked()

  // Create map from list provided
  const groupsMap: Record<string, ValidatorGroup> = {}
  for (const group of groups) {
    groupsMap[group.address] = { ...group }
  }

  // Process vote-related details about the validator groups
  for (let i = 0; i < eligibleGroups.length; i++) {
    const groupAddr = eligibleGroups[i]
    const numVotes = groupVotes[i]
    const group = groupsMap[groupAddr]
    if (!group) {
      logger.warn('No group found matching votes, group list must be stale')
      continue
    }
    group.eligible = true
    group.capacity = getValidatorGroupCapacity(group, totalValidators, totalLocked)
    group.votes = numVotes.toString()
  }
  return Object.values(groupsMap)
}

async function fetchVotesAndTotalLocked() {
  const lockedGold = getContract(CeloContract.LockedGold)
  const election = getContract(CeloContract.Election)
  const votesP: Promise<EligibleGroupsVotesRaw> = election.getTotalVotesForEligibleValidatorGroups()
  const totalLockedP: Promise<BigNumberish> = lockedGold.getTotalLockedGold()
  const [votes, totalLocked] = await Promise.all([votesP, totalLockedP])
  const eligibleGroups = votes[0]
  const groupVotes = votes[1]
  return { eligibleGroups, groupVotes, totalLocked }
}

function getValidatorGroupCapacity(
  group: ValidatorGroup,
  totalValidators: number,
  totalLocked: BigNumberish
) {
  const numMembers = Object.keys(group.members).length
  return BigNumber.from(totalLocked)
    .mul(numMembers + 1)
    .div(Math.min(MAX_NUM_ELECTABLE_VALIDATORS, totalValidators))
    .toString()
}

export const {
  name: fetchValidatorsSagaName,
  wrappedSaga: fetchValidatorsSaga,
  reducer: fetchValidatorsReducer,
  actions: fetchValidatorsActions,
} = createMonitoredSaga<FetchValidatorsParams>(fetchValidators, 'fetchValidators')
