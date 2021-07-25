import { BigNumber } from 'ethers'
import {
  StakeEvent,
  StakeEventTableRow,
  Validator,
  ValidatorGroup,
  ValidatorGroupStatus,
  ValidatorGroupTableRow,
  ValidatorStatus,
} from 'src/features/validators/types'
import { areAddressesEqual } from 'src/utils/addresses'
import { fromWei } from 'src/utils/amount'

export function validatorGroupsToTableData(groups: ValidatorGroup[]): ValidatorGroupTableRow[] {
  const tableRows: ValidatorGroupTableRow[] = []
  const totalVotesWei = groups.reduce((sum, g) => sum.add(g.votes), BigNumber.from(0))

  for (const group of groups) {
    const members = Object.values(group.members)
    const { numMembers, numElected, averageScore } = getValidatorMemberStats(members)
    const status = getValidatorGroupStatus(group, averageScore)
    const votes = fromWei(group.votes)
    const totalVotes = fromWei(totalVotesWei)
    const percent = (votes / totalVotes) * 100
    const row = {
      id: group.address,
      address: group.address,
      name: group.name || 'Unnamed Group',
      url: group.url,
      members: group.members,
      numMembers,
      numElected,
      votes,
      percent,
      status,
    }
    tableRows.push(row)
  }

  return tableRows
}

function getValidatorMemberStats(members: Validator[]) {
  const numMembers = members.length
  let numElected = 0
  let totalScoreWei = BigNumber.from(0)
  for (const validator of members) {
    if (validator.status === ValidatorStatus.Elected) {
      numElected += 1
      totalScoreWei = totalScoreWei.add(validator.score)
    }
  }

  let averageScore: number
  if (numElected) {
    const totalScore = fromWei(totalScoreWei)
    averageScore = Math.round(totalScore / numElected)
  } else {
    averageScore = 0
  }
  return { numMembers, numElected, averageScore }
}

function getValidatorGroupStatus(group: ValidatorGroup, averageScore: number) {
  if (!group.eligible) {
    return ValidatorGroupStatus.Poor
  }
  if (BigNumber.from(group.capacity).lte(group.votes)) {
    return ValidatorGroupStatus.Full
  }
  if (averageScore >= 9.5) {
    return ValidatorGroupStatus.Good
  }
  if (averageScore >= 8) {
    return ValidatorGroupStatus.Okay
  }
  return ValidatorGroupStatus.Poor
}

export function stakeEventsToTableData(
  stakeEvents: StakeEvent[],
  groups: ValidatorGroup[]
): StakeEventTableRow[] {
  const tableRows: StakeEventTableRow[] = []
  for (const event of stakeEvents) {
    const { txHash, group, type, value, timestamp } = event
    const validatorGroup = groups.find((g) => areAddressesEqual(g.address, group))
    const row = {
      id: txHash,
      group: validatorGroup ? validatorGroup.name : group,
      action: type,
      amount: fromWei(value),
      timestamp,
    }
    tableRows.push(row)
  }
  return tableRows
}
