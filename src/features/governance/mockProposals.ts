import { ProposalStage, VoteValue } from 'src/features/governance/types'

export const mockProposals = [
  {
    id: '20',
    timestamp: Date.now() - 86400000,
    description: 'Celo Core Contracts Release 2',
    url: 'https://github.com/celo-org/celo-proposals/blob/master/CGPs/0020.md',
    stage: ProposalStage.Queued,
    votes: {
      [VoteValue.Yes]: '61088430',
      [VoteValue.No]: '0',
      [VoteValue.Abstain]: '0',
    },
  },
  {
    id: '21',
    timestamp: Date.now(),
    description: 'Update randomnessBlockRetentionWindow to Extend Attestation Expiration Duration',
    url: 'https://github.com/celo-org/celo-proposals/blob/master/CGPs/0021.md',
    stage: ProposalStage.Approval,
    votes: {
      [VoteValue.Yes]: '21088430',
      [VoteValue.No]: '6000000',
      [VoteValue.Abstain]: '1002',
    },
  },
  {
    id: '22',
    timestamp: Date.now(),
    description: 'Update referendumStageDuration ',
    url: 'https://github.com/celo-org/celo-proposals/blob/master/CGPs/0022.md',
    stage: ProposalStage.Referendum,
    votes: {
      [VoteValue.Yes]: '91088430',
      [VoteValue.No]: '2900283',
      [VoteValue.Abstain]: '1',
    },
  },
]
