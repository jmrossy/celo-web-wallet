import { BigNumber, BigNumberish } from 'ethers'
import { Currency } from 'src/currency'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import {
  GroupVotes,
  StakeActionType,
  StakeTokenParams,
  ValidatorGroup,
} from 'src/features/validators/types'
import { findValidatorGroupName, getStakingMaxAmount } from 'src/features/validators/utils'
import { Balances } from 'src/features/wallet/types'
import { ChartDataColors, Color } from 'src/styles/Color'
import { shortenAddress } from 'src/utils/addresses'
import { BigNumberMin, fromWeiRounded } from 'src/utils/amount'

// Just for convinience / shortness cause this file has lots of conversions
function fromWei(value: BigNumberish) {
  return parseFloat(fromWeiRounded(value, Currency.CELO, true))
}

export function getSummaryChartData(
  balances: Balances,
  groups: ValidatorGroup[],
  votes: GroupVotes
) {
  return getChartData(balances, groups, votes)
}

export function getResultChartData(
  balances: Balances,
  groups: ValidatorGroup[],
  votes: GroupVotes,
  values: StakeTokenParams
) {
  return getChartData(balances, groups, votes, values)
}

function getChartData(
  balances: Balances,
  groups: ValidatorGroup[],
  votes: GroupVotes,
  values?: StakeTokenParams
) {
  const chartData = []
  const votedGroups = Object.keys(votes)
  let totalVoted = BigNumber.from(0)
  for (let i = 0; i < votedGroups.length; i++) {
    const groupAddr = votedGroups[i]
    const vote = votes[groupAddr]
    const name = findValidatorGroupName(groups, groupAddr) || shortenAddress(groupAddr, true)
    const color = ChartDataColors[i % ChartDataColors.length]
    let pendingAndActive = BigNumber.from(vote.pending).add(vote.active)

    if (values) {
      const { groupAddress: targetGroup, amountInWei: targetAmount, action } = values
      const maxAmount = getStakingMaxAmount(action, balances, votes, targetGroup)
      const difference = BigNumberMin(BigNumber.from(targetAmount), maxAmount)
      if (action === StakeActionType.Vote) {
        pendingAndActive = pendingAndActive.add(difference)
      } else if (action === StakeActionType.Revoke) {
        pendingAndActive = pendingAndActive.sub(difference)
      }
    }

    totalVoted = totalVoted.add(pendingAndActive)
    chartData.push({
      label: name,
      value: fromWei(pendingAndActive),
      color,
    })
  }

  const totalLocked = getTotalLockedCelo(balances)
  const nonvotingLocked = totalLocked.sub(totalVoted)

  chartData.push({
    label: 'Unused Locked',
    value: fromWei(nonvotingLocked),
    color: Color.altGrey,
    labelColor: Color.chartGrey,
  })

  return {
    data: chartData,
    total: { label: 'Total Locked', value: fromWei(totalLocked) },
  }
}
