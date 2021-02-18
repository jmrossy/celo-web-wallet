import { BigNumber } from 'ethers'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { GroupVotes, StakeActionType, ValidatorGroup } from 'src/features/validators/types'
import { Balances } from 'src/features/wallet/types'
import { trimToLength } from 'src/utils/string'

const MAX_GROUP_NAME_LENGTH = 20

// Find and format group name
export function findValidatorGroupName(groups: ValidatorGroup[], groupAddress: string) {
  if (!groups || !groups.length || !groupAddress) return null
  const group = groups.find((g) => g.address === groupAddress)
  if (!group) return null
  return getValidatorGroupName(group)
}

export function getValidatorGroupName(group: ValidatorGroup, useDefault = false) {
  const name = trimToLength(group.name, MAX_GROUP_NAME_LENGTH)
  if (!name && useDefault) return 'Unnamed Group'
  else return name
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
