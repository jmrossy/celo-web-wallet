import { fetchProposalDescription } from 'src/features/governance/fetchDescription'

// TODO these are causing flaky 403s when running in CI. Skipping for now
xdescribe('fetchProposals', () => {
  it('Fetches and processes as expected', async () => {
    const prop1Desc = await fetchProposalDescription(
      'https://github.com/celo-org/governance/blob/main/CGPs/cgp-0001.md'
    )
    expect(prop1Desc).toBe('Enable validator elections, epoch rewards and carbon offsetting')
    const prop21Desc = await fetchProposalDescription(
      'https://github.com/celo-org/governance/blob/main/CGPs/cgp-0021.md'
    )
    expect(prop21Desc).toBe(
      'Update randomnessBlockRetentionWindow to Extend Attestation Expiration Duration'
    )
  })
})
