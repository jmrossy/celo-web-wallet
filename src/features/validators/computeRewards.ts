import { BigNumber } from 'ethers'
import { GroupVotes, StakeEvent, StakeEventType } from 'src/features/validators/types'
import { fromWei } from 'src/utils/amount'
import { logger } from 'src/utils/logger'

export function computeGroupStakingRewards(
  stakeEvents: StakeEvent[],
  groupVotes: GroupVotes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: 'apy' | 'amount' = 'amount'
) {
  const groupTotals: Record<string, BigNumber> = {} // group addr to sum votes
  for (const event of stakeEvents) {
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { group, type, value, timestamp } = event
    if (!groupTotals[group]) groupTotals[group] = BigNumber.from(0)
    if (type === StakeEventType.Activate) {
      groupTotals[group] = groupTotals[group].sub(value)
    } else if (type === StakeEventType.Revoke) {
      groupTotals[group] = groupTotals[group].add(value)
    }
  }

  const groupRewards: Record<string, number> = {} // group addr to rewards in units (not wei)
  for (const group of Object.keys(groupTotals)) {
    const currentVotes = BigNumber.from(groupVotes[group]?.active || 0)
    const totalVoted = groupTotals[group]
    const reward = currentVotes.add(totalVoted)
    groupRewards[group] = fromWei(reward)
    if (reward.lt(0)) {
      logger.warn('Reward for group < 0, should never happen', reward.toString(), group)
    }
  }

  return groupRewards
}
