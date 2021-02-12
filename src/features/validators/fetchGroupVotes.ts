import { BigNumber } from 'ethers'
import { batchCall } from 'src/blockchain/batchCall'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { GroupVotes } from 'src/features/validators/types'

export async function fetchGroupVotes(accountAddress: string) {
  const election = getContract(CeloContract.Election)

  const groupAddrs: string[] = await election.getGroupsVotedForByAccount(accountAddress)
  if (!groupAddrs.length) return {}

  const groupAddrsAndAccount = groupAddrs.map((a) => [a, accountAddress])

  const pendingVotesP: Promise<string[]> = batchCall(
    election,
    'getPendingVotesForGroupByAccount',
    groupAddrsAndAccount,
    100
  )
  const activeVotesP: Promise<string[]> = batchCall(
    election,
    'getActiveVotesForGroupByAccount',
    groupAddrsAndAccount,
    100
  )

  const [pendingVotes, activeVotes] = await Promise.all([pendingVotesP, activeVotesP])

  if (groupAddrs.length !== pendingVotes.length || groupAddrs.length !== activeVotes.length) {
    throw new Error('Groups list / votes size mismatch')
  }

  const votes: GroupVotes = {}
  for (let i = 0; i < groupAddrs.length; i++) {
    const groupAddr = groupAddrs[i]
    const pending = BigNumber.from(pendingVotes[i]).toString()
    const active = BigNumber.from(activeVotes[i]).toString()
    votes[groupAddr] = { pending, active }
  }

  return votes
}
