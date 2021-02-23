import { FeeEstimate } from 'src/features/fees/types'

export enum VoteValue {
  None = 'none',
  Abstain = 'abstain',
  No = 'no',
  Yes = 'yes',
}

// Used to go from VoteValue enum to Governance Contract's enum
export const OrderedVoteValue = [VoteValue.None, VoteValue.Abstain, VoteValue.No, VoteValue.Yes]

export function voteValueToLabel(value: VoteValue) {
  if (value === VoteValue.None) return 'None'
  if (value === VoteValue.Abstain) return 'Abstain'
  if (value === VoteValue.No) return 'No'
  if (value === VoteValue.Yes) return 'Yes'
  throw new Error(`Invalid vote value: ${value}`)
}

// Using ints to align with solidity enum
export enum ProposalStage {
  None = 0,
  Queued = 1,
  Approval = 2,
  Referendum = 3,
  Execution = 4,
  Expiration = 5,
}

export interface Proposal {
  id: string
  timestamp: number
  description: string | null
  url: string
  stage: ProposalStage
  votes: {
    [VoteValue.Yes]: string
    [VoteValue.No]: string
    [VoteValue.Abstain]: string
  }
}

export interface GovernanceVoteParams {
  proposalId: string
  value: VoteValue
  feeEstimate?: FeeEstimate
}
