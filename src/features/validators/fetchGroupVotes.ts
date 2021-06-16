import { BigNumber } from 'ethers'
import type { RootState } from 'src/app/rootReducer'
import { batchCall } from 'src/blockchain/batchCall'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { VALIDATOR_ACTIVATABLE_STALE_TIME } from 'src/consts'
import { GroupVotes } from 'src/features/validators/types'
import { updateGroupVotes, updateHasActivatable } from 'src/features/validators/validatorsSlice'
import { getVoterAccountAddress } from 'src/features/wallet/utils'
import { isStale } from 'src/utils/time'
import { call, put, select } from 'typed-redux-saga'

export function* fetchStakingBalances() {
  const voterAccountAddress = yield* call(getVoterAccountAddress)

  const validatorGroupVotes = yield* call(fetchGroupVotes, voterAccountAddress)
  yield* put(updateGroupVotes(validatorGroupVotes))

  const activatableLastUpdated = yield* select(
    (state: RootState) => state.validators.hasActivatable.lastUpdated
  )
  if (isStale(activatableLastUpdated, VALIDATOR_ACTIVATABLE_STALE_TIME)) {
    const hasActivatable = yield* call(
      checkHasActivatable,
      validatorGroupVotes,
      voterAccountAddress
    )
    yield* put(updateHasActivatable(hasActivatable))
  }
}

export async function fetchGroupVotes(accountAddress: string) {
  const election = getContract(CeloContract.Election)

  const groupAddrs: string[] = await election.getGroupsVotedForByAccount(accountAddress)
  if (!groupAddrs.length) return {}

  const groupAddrsAndAccount = groupAddrs.map((a) => [a, accountAddress])

  const pendingVotesP: Promise<string[]> = batchCall(
    election,
    'getPendingVotesForGroupByAccount',
    groupAddrsAndAccount
  )
  const activeVotesP: Promise<string[]> = batchCall(
    election,
    'getActiveVotesForGroupByAccount',
    groupAddrsAndAccount
  )

  const [pendingVotes, activeVotes] = await Promise.all([pendingVotesP, activeVotesP])

  if (groupAddrs.length !== pendingVotes.length || groupAddrs.length !== activeVotes.length) {
    throw new Error('Groups list / votes size mismatch')
  }

  const votes: GroupVotes = {}
  for (let i = 0; i < groupAddrs.length; i++) {
    const groupAddr = groupAddrs[i]
    const pending = BigNumber.from(pendingVotes[i]).toString()
    const active = BigNumber.from(activeVotes[i]).toString()
    votes[groupAddr] = { pending, active }
  }

  return votes
}

async function checkHasActivatable(groupVotes: GroupVotes, accountAddress: string) {
  const groupsWithPending = Object.keys(groupVotes).filter((groupAddr) =>
    BigNumber.from(groupVotes[groupAddr].pending).gt(0)
  )
  if (!groupsWithPending.length) {
    return {
      status: false,
      lastUpdated: Date.now(),
      reminderDismissed: false,
      groupAddresses: [],
    }
  }

  const election = getContract(CeloContract.Election)
  const groupAddrsAndAccount = groupsWithPending.map((a) => [accountAddress, a])
  const hasActivatable: boolean[] = await batchCall(
    election,
    'hasActivatablePendingVotes',
    groupAddrsAndAccount
  )
  if (groupsWithPending.length !== hasActivatable.length)
    throw new Error('Groups, activatable lists size mismatch')
  const groupToActivate = groupsWithPending.filter((v, i) => !!hasActivatable[i])
  const status = groupToActivate.length > 0

  return {
    status,
    lastUpdated: Date.now(),
    reminderDismissed: false,
    groupAddresses: groupToActivate,
  }
}
