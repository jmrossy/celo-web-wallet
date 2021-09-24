import { fetchProposalDescription } from 'src/features/governance/fetchDescription'
import { Proposal, ProposalStage, VoteValue } from 'src/features/governance/types'

// TODO these are causing flaky 403s when running in CI. Skipping for now
xdescribe('fetchProposals', () => {
  const proposal: Proposal = {
    id: '21',
    timestamp: 123,
    description: 'Test prop',
    url: '',
    stage: ProposalStage.Referendum,
    votes: {
      [VoteValue.Yes]: '1',
      [VoteValue.No]: '0',
      [VoteValue.Abstain]: '0',
    },
  }

  it('Fetches and processes as expected for old format', async () => {
    const prop1Desc = await fetchProposalDescription({
      ...proposal,
      id: '1',
      url: 'https://github.com/celo-org/governance/blob/main/CGPs/cgp-0001.md',
    })
    expect(prop1Desc).toBe('Enable validator elections, epoch rewards and carbon offsetting')

    const prop21Desc = await fetchProposalDescription({
      ...proposal,
      id: '21',
      url: 'https://github.com/celo-org/governance/blob/main/CGPs/cgp-0021.md',
    })
    expect(prop21Desc).toBe(
      'Update randomnessBlockRetentionWindow to Extend Attestation Expiration Duration'
    )
  })

  it('Fetches and processes as expected for new format', async () => {
    const prop35Desc = await fetchProposalDescription({
      ...proposal,
      id: '35',
      url: 'https://github.com/celo-org/governance/blob/main/CGPs/cgp-0035.md',
    })
    expect(prop35Desc).toBe('Reduce the Epoch Rewards Community Fund share from 25% to 5%')
  })
})
