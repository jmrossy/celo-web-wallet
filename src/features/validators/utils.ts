import { BigNumber } from 'ethers'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { GroupVotes, ValidatorGroup } from 'src/features/validators/types'
import { Balances } from 'src/features/wallet/types'

const MAX_GROUP_NAME_LENGTH = 27

// Find and format group name
export function getValidatorGroupName(groups: ValidatorGroup[], groupAddress: string) {
  if (!groups || !groups.length || !groupAddress) return null
  const group = groups.find((g) => g.address === groupAddress)
  if (!group) return null
  const name = group.name.trim()
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
