import { BigNumber, BigNumberish } from 'ethers'
import { BARCHART_MIN_SHOW_AMOUNT } from 'src/consts'
import { Balances } from 'src/features/balances/types'
import {
  GroupVotes,
  StakeActionType,
  StakeTokenParams,
  ValidatorGroup,
} from 'src/features/validators/types'
import { findValidatorGroupName, getStakingMaxAmount } from 'src/features/validators/utils'
import { ChartDataColors, ChartDataColorsLighter, Color } from 'src/styles/Color'
import { BigNumberMax, BigNumberMin, fromWeiRounded } from 'src/utils/amount'

// Just for convenience / shortness cause this file has lots of conversions
function fromWei(value: BigNumberish) {
  return parseFloat(fromWeiRounded(value))
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
  // First, adjust votes based on form values (if provided)
  const adjustedVotes: GroupVotes = JSON.parse(JSON.stringify(votes))
  if (values?.groupAddress && values?.amountInWei) {
    const { groupAddress: groupAddr, amountInWei: targetAmount, action } = values
    const amount = BigNumberMin(
      BigNumber.from(targetAmount),
      getStakingMaxAmount(action, balances, votes, groupAddr)
    )

    // Create vote entry if it doesn't exist
    if (!adjustedVotes[groupAddr]) {
      adjustedVotes[groupAddr] = {
        active: '0',
        pending: '0',
      }
    }
    const targetGroup = adjustedVotes[groupAddr]

    if (action === StakeActionType.Vote) {
      targetGroup.pending = BigNumber.from(targetGroup.pending).add(amount).toString()
    } else if (action === StakeActionType.Revoke) {
      const pendingAmount = BigNumber.from(targetGroup.pending)
      const pendingRevokeAmount = BigNumberMin(pendingAmount, amount)
      targetGroup.pending = pendingAmount.sub(pendingRevokeAmount).toString()
      const activeRevokeAmount = BigNumberMax(amount.sub(pendingRevokeAmount), BigNumber.from(0))
      targetGroup.active = BigNumber.from(targetGroup.active).sub(activeRevokeAmount).toString()
    } else if (action === StakeActionType.Activate) {
      targetGroup.pending = '0'
      targetGroup.active = BigNumber.from(targetGroup.active).add(amount).toString()
    }
  }

  // Next, create chart data set
  const chartData = []
  const votedGroups = Object.keys(adjustedVotes)
  let totalVoted = BigNumber.from(0)
  for (let i = 0; i < votedGroups.length; i++) {
    const groupAddr = votedGroups[i]
    const vote = adjustedVotes[groupAddr]
    if (BigNumber.from(vote.active).gt(BARCHART_MIN_SHOW_AMOUNT)) {
      chartData.push(createGroupDataPoint(groups, groupAddr, vote.active, i))
    }
    if (BigNumber.from(vote.pending).gt(BARCHART_MIN_SHOW_AMOUNT)) {
      chartData.push(createGroupDataPoint(groups, groupAddr, vote.pending, i, true))
    }
    totalVoted = totalVoted.add(vote.pending).add(vote.active)
  }

  const totalLocked = BigNumber.from(balances.lockedCelo.locked)
  const nonvotingLocked = BigNumberMax(totalLocked.sub(totalVoted), BigNumber.from(0))

  // Finally, add in data point for unused locked CELO
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
  let name = findValidatorGroupName(groups, groupAddr, 'address')
  const colorIndex = index % ChartDataColors.length
  let color = ChartDataColors[colorIndex]
  if (isPending) {
    name += ' (Pending)'
    color = ChartDataColorsLighter[colorIndex]
  }
  return {
    label: name,
    value: fromWei(valueInWei),
    color,
  }
}
