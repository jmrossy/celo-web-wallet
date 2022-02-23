import { BigNumberish } from 'ethers'
import { FeeEstimate } from 'src/features/fees/types'

export type EligibleGroupsVotesRaw = [Address[], BigNumberish[]] // group addresses then votes

export interface ValidatorGroup {
  address: Address
  name: string
  url: string
  eligible: boolean
  capacity: string
  votes: string
  members: Record<Address, Validator>
}

export enum ValidatorStatus {
  NotElected = 0,
  Elected = 1,
}

export interface Validator {
  address: Address
  name: string
  score: string
  signer: Address
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
  address: Address
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
  Activate = 'activate',
  Revoke = 'revoke',
}

export function stakeActionLabel(type: StakeActionType, activeTense = false) {
  if (type === StakeActionType.Vote) {
    return activeTense ? 'Voting' : 'Vote'
  } else if (type === StakeActionType.Activate) {
    return activeTense ? 'Activating' : 'Activate'
  } else if (type === StakeActionType.Revoke) {
    return activeTense ? 'Revoking' : 'Revoke'
  } else {
    throw new Error(`Invalid lock action type: ${type}`)
  }
}

export interface StakeTokenParams {
  groupAddress: Address
  amountInWei: string
  action: StakeActionType
  feeEstimates?: FeeEstimate[]
}

export type GroupVotes = Record<string, { active: string; pending: string }> // address to votes

export enum StakeEventType {
  Activate = 'activate',
  Revoke = 'revoke', // Revoke of active votes (i.e. not pending)
}

export interface StakeEvent {
  type: StakeEventType
  group: Address
  value: string
  units: string
  blockNumber: number
  timestamp: number
  txHash: string
}

export interface StakeEventTableRow {
  id: string
  group: string // group name or address
  action: StakeEventType
  amount: number
  timestamp: number
}
