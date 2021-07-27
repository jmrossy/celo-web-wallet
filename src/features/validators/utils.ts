import { BigNumber } from 'ethers'
import { GroupVotes, StakeActionType, ValidatorGroup } from 'src/features/validators/types'
import { Balances } from 'src/features/wallet/types'
import { areAddressesEqual, shortenAddress } from 'src/utils/addresses'
import { trimToLength } from 'src/utils/string'

const MAX_GROUP_NAME_LENGTH = 20
const DEFAULT_GROUP_NAME = 'Unnamed Group'

// Find and format group name
export function findValidatorGroupName(
  groups: ValidatorGroup[],
  groupAddr: string,
  fallback: 'name' | 'address'
) {
  if (!groups || !groups.length || !groupAddr) return getFallbackGroupName(groupAddr, fallback)
  const group = groups.find((g) => areAddressesEqual(g.address, groupAddr))
  if (!group) return getFallbackGroupName(groupAddr, fallback)
  return getValidatorGroupName(group, true)
}

export function getValidatorGroupName(group: ValidatorGroup, useDefault = false) {
  const name = trimToLength(group.name, MAX_GROUP_NAME_LENGTH)
  if (!name && useDefault) return DEFAULT_GROUP_NAME
  else return name
}

function getFallbackGroupName(groupAddr: string, fallback: 'name' | 'address') {
  if (fallback === 'name' || !groupAddr) return DEFAULT_GROUP_NAME
  else return shortenAddress(groupAddr, true)
}

export function getTotalNonvotingLocked(balances: Balances, votes: GroupVotes) {
  const totalLocked = BigNumber.from(balances.lockedCelo.locked)
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
