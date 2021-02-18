import { FeeEstimate } from 'src/features/fees/types'

export enum VoteValue {
  Yes = 'yes',
  No = 'no',
  Abstain = 'abstain',
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
  description: string
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
