import { FeeEstimate } from 'src/features/fees/types'

export interface ValidatorGroup {
  address: string
  name: string
  url: string
  eligible: boolean
  capacity: string
  votes: string
  members: Record<string, Validator>
}

export enum ValidatorStatus {
  NotElected = 0,
  Elected = 1,
}

export interface Validator {
  address: string
  name: string
  score: string
  signer: string
  status: ValidatorStatus
}

export enum ValidatorGroupStatus {
  Poor = -1,
  Full = 0,
  Okay = 1,
  Good = 2,
}

export interface ValidatorGroupTableRow {
  id: string
  address: string
  name: string
  url: string
  members: Record<string, Validator>
  numElected: number
  numMembers: number
  votes: number
  percent: number
  status: ValidatorGroupStatus
}

export enum StakeActionType {
  Vote = 'vote',
  Revoke = 'revoke',
}

export function stakeActionLabel(type: StakeActionType, activeTense = false) {
  if (type === StakeActionType.Vote) {
    return activeTense ? 'Voting' : 'Vote'
  } else if (type === StakeActionType.Revoke) {
    return activeTense ? 'Revoking' : 'Revoke'
  } else {
    throw new Error(`Invalid lock action type: ${type}`)
  }
}

export interface StakeTokenParams {
  groupAddress: string
  amountInWei: string
  action: StakeActionType
  feeEstimates?: FeeEstimate[]
}

export type GroupVotes = Record<string, { active: string; pending: string }> // address to votes
