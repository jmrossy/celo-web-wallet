import { BigNumber } from 'ethers'
import {
  Validator,
  ValidatorGroup,
  ValidatorGroupStatus,
  ValidatorGroupTableRow,
  ValidatorStatus,
} from 'src/features/validators/types'
import { formatNumberWithCommas, fromWei } from 'src/utils/amount'

export function validatorGroupsToTableData(groups: ValidatorGroup[]): ValidatorGroupTableRow[] {
  const tableRows: ValidatorGroupTableRow[] = []
  const totalVotes = groups.reduce((sum, g) => sum.add(g.votes), BigNumber.from(0))

  for (const group of groups) {
    const members = Object.values(group.members)
    const { numMembers, numElected, averageScore } = getValidatorMemberStats(members)
    const status = getValidatorGroupStatus(group, averageScore)
    const { votes, percent } = getVoteStats(group.votes, totalVotes)
    const displayName = group.name ? group.name.trim().substring(0, 30) : 'Unnamed Group'
    const row = {
      id: group.address,
      address: group.address,
      name: displayName,
      elected: `${numElected}/${numMembers}`,
      votes: votes,
      percent: `${percent}%`,
      status: status,
    }
    tableRows.push(row)
  }

  return tableRows
}

function getVoteStats(votesWei: string, totalVotesWei: BigNumber) {
  const votes = fromWei(votesWei)
  const votesFormatted = formatNumberWithCommas(Math.round(votes))
  const totalVotes = fromWei(totalVotesWei)
  const percent = (votes / totalVotes) * 100
  return { votes: votesFormatted, percent: percent.toFixed(2) }
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
