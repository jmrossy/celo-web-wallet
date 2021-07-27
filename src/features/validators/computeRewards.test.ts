import { computeGroupStakingRewards } from 'src/features/validators/computeRewards'
import { GroupVotes, StakeEvent, StakeEventType } from 'src/features/validators/types'
import { toWei } from 'src/utils/amount'

function wei(amount: number) {
  return toWei(amount).toString()
}

function groupVotes(activeAmount: number, group = '0x1'): GroupVotes {
  return {
    [group]: { active: wei(activeAmount), pending: '' },
  }
}

const activate1: StakeEvent = {
  type: StakeEventType.Activate,
  group: '0x1',
  value: wei(1),
  units: '',
  blockNumber: 0,
  timestamp: 1627310000000,
  txHash: '',
}
const revoke1: StakeEvent = {
  ...activate1,
  type: StakeEventType.Revoke,
  value: wei(0.5),
  timestamp: 1627320000000,
}
const activate2: StakeEvent = {
  ...activate1,
  group: '0x1',
  value: wei(2),
  timestamp: 1627330000000,
}
const revoke2: StakeEvent = {
  ...revoke1,
  value: wei(3),
  timestamp: 1627340000000,
}

const activate3: StakeEvent = {
  ...activate1,
  group: '0x2',
  value: wei(1000),
}

describe('Computes rewards correctly', () => {
  it('For a simple activation', () => {
    const rewards = computeGroupStakingRewards([activate1], groupVotes(1.1))
    expect(rewards).toEqual({ '0x1': 0.1 })
  })
  it('For a simple activation and revoke', () => {
    const rewards = computeGroupStakingRewards([activate1, revoke1], groupVotes(0.6))
    expect(rewards).toEqual({ '0x1': 0.1 })
  })
  it('For a complex activation and revoke', () => {
    const rewards = computeGroupStakingRewards(
      [activate1, revoke1, activate2, revoke2],
      groupVotes(0)
    )
    expect(rewards).toEqual({ '0x1': 0.5 })
  })
  it('For a multiple groups', () => {
    const votes = { ...groupVotes(0.55), ...groupVotes(1005, '0x2') }
    const rewards = computeGroupStakingRewards([activate1, revoke1, activate3], votes)
    expect(rewards).toEqual({ '0x1': 0.05, '0x2': 5 })
  })
})
