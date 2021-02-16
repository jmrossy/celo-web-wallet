import { BigNumber } from 'ethers'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { GroupVotes, StakeActionType, ValidatorGroup } from 'src/features/validators/types'
import { Balances } from 'src/features/wallet/types'

const MAX_GROUP_NAME_LENGTH = 25

// Find and format group name
export function findValidatorGroupName(groups: ValidatorGroup[], groupAddress: string) {
  if (!groups || !groups.length || !groupAddress) return null
  const group = groups.find((g) => g.address === groupAddress)
  if (!group) return null
  return getValidatorGroupName(group)
}

export function getValidatorGroupName(group: ValidatorGroup, useDefault = false) {
  let name = group.name.trim()
  if (!name && useDefault) name = 'Unnamed Group'
  return name.length > MAX_GROUP_NAME_LENGTH
    ? name.substring(0, MAX_GROUP_NAME_LENGTH) + '...'
    : name
}

export function getTotalNonvotingLocked(balances: Balances, votes: GroupVotes) {
  const totalLocked = getTotalLockedCelo(balances)
  const totalVoted = Object.values(votes).reduce(
    (sum, v) => sum.add(v.active).add(v.pending),
    BigNumber.from(0)
  )
  return totalLocked.sub(totalVoted)
}

export function getStakingMaxAmount(
  action: StakeActionType,
  balances: Balances,
  votes: GroupVotes,
  targetGroup: string
) {
  if (action === StakeActionType.Vote) {
    return getTotalNonvotingLocked(balances, votes)
  } else if (action === StakeActionType.Revoke) {
    const groupVote = votes[targetGroup]
    return groupVote ? BigNumber.from(groupVote.active).add(groupVote.pending) : BigNumber.from(0)
  } else if (action === StakeActionType.Activate) {
    const groupVote = votes[targetGroup]
    return groupVote ? BigNumber.from(groupVote.pending) : BigNumber.from(0)
  } else {
    throw new Error(`Invalid stake action type ${action}`)
  }
}
