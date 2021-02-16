import { BigNumber, BigNumberish } from 'ethers'
import { Currency } from 'src/currency'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { GroupVotes, StakeTokenParams, ValidatorGroup } from 'src/features/validators/types'
import { findValidatorGroupName, getStakingMaxAmount } from 'src/features/validators/utils'
import { Balances } from 'src/features/wallet/types'
import { ChartDataColors, ChartDataColorsLighter, Color } from 'src/styles/Color'
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
  let targetGroupDataPointPending = null // keep track of target group's data if it exists (for result chart)
  let targetGroupDataPointActive = null // keep track of target group's data if it exists (for result chart)
  let i = 0
  for (i = 0; i < votedGroups.length; i++) {
    const groupAddr = votedGroups[i]
    const vote = votes[groupAddr]
    if (BigNumber.from(vote.pending).gt(0)) {
      const dataPoint = createGroupDataPoint(groups, groupAddr, vote.pending, i, true)
      chartData.push(dataPoint)
      if (values?.groupAddress === groupAddr) targetGroupDataPointPending = dataPoint
    }
    if (BigNumber.from(vote.active).gt(0)) {
      const dataPoint = createGroupDataPoint(groups, groupAddr, vote.active, i, false)
      chartData.push(dataPoint)
      if (values?.groupAddress === groupAddr) targetGroupDataPointActive = dataPoint
    }
    totalVoted = totalVoted.add(vote.pending).add(vote.active)
  }

  // If values are provided (result chart) adjust the data as needed
  if (values?.groupAddress) {
    const { groupAddress: targetGroup, amountInWei: targetAmount, action } = values
    const maxAmount = getStakingMaxAmount(action, balances, votes, targetGroup)
    const adjustedAmount = BigNumberMin(BigNumber.from(targetAmount), maxAmount)
    // if (action === StakeActionType.Vote) {
    //   if (targetGroupDataPoint) {
    //     targetGroupDataPoint.value += fromWei(adjustedAmount)
    //   } else {
    //     const dataPoint = createGroupDataPoint(groups, targetGroup, adjustedAmount, i)
    //     chartData.push(dataPoint)
    //   }
    //   totalVoted = totalVoted.add(adjustedAmount)
    // } else if (action === StakeActionType.Revoke) {
    //   if (targetGroupDataPoint) {
    //     targetGroupDataPoint.value -= fromWei(adjustedAmount)
    //   }
    //   totalVoted = totalVoted.sub(adjustedAmount)
    // } else if (action === StakeActionType.Activate) {
    //   if (targetGroupDataPointPending) {
    //     targetGroupDataPoint.value -= fromWei(adjustedAmount)
    //   }
    // }
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

function createGroupDataPoint(
  groups: ValidatorGroup[],
  groupAddr: string,
  valueInWei: BigNumberish,
  index: number,
  isPending?: boolean
) {
  let name = findValidatorGroupName(groups, groupAddr) || shortenAddress(groupAddr, true)
  let color = ChartDataColors[index % ChartDataColors.length]
  if (isPending) {
    name += ' (Pending)'
    color = ChartDataColorsLighter[index % ChartDataColors.length]
  }
  return {
    label: name,
    value: fromWei(valueInWei),
    color,
  }
}
