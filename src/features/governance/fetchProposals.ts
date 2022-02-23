import { BigNumber, BigNumberish } from 'ethers'
import { appSelect } from 'src/app/appSelect'
import { batchCall } from 'src/blockchain/batchCall'
import { getContract } from 'src/blockchain/contracts'
import { CeloContract } from 'src/config'
import { PROPOSAL_LIST_STALE_TIME } from 'src/consts'
import { fetchProposalDescription } from 'src/features/governance/fetchDescription'
import { updateProposals } from 'src/features/governance/governanceSlice'
import { Proposal, ProposalStage, VoteValue } from 'src/features/governance/types'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, put } from 'typed-redux-saga'

type QueueRaw = [BigNumberish[], BigNumberish[]] //IDs then upvotes
// proposer, deposit, timestamp, txLength, url
type ProposalRaw = [string, BigNumberish, BigNumberish, BigNumberish, string]
// Yes, no, abstain
type VoteTotalsRaw = [BigNumberish, BigNumberish, BigNumberish]

interface FetchProposalsParams {
  force?: boolean
}

function* fetchProposals({ force }: FetchProposalsParams) {
  const { proposals, lastUpdated } = yield* appSelect((state) => state.governance)

  if (
    force ||
    !proposals.length ||
    !lastUpdated ||
    isStale(lastUpdated, PROPOSAL_LIST_STALE_TIME)
  ) {
    const proposals = yield* call(fetchCurrentProposals)
    yield* put(updateProposals({ proposals, lastUpdated: Date.now() }))
  }
}

export async function fetchCurrentProposals(): Promise<Proposal[]> {
  const governance = getContract(CeloContract.Governance)

  // Get unexpired queued and dequeued proposals
  const queuedP: Promise<QueueRaw> = governance.getQueue()
  const dequeuedP: Promise<BigNumberish[]> = governance.getDequeue()
  const [queued, dequeued] = await Promise.all([queuedP, dequeuedP])

  let queuedIds = queued[0].map((id) => BigNumber.from(id).toString()).filter((id) => !!id)
  if (queuedIds.length) {
    const areExpired: boolean[] = await batchCall(governance, 'isQueuedProposalExpired', queuedIds)
    queuedIds = queuedIds.filter((id, index) => !areExpired[index])
  }

  const dequeuedIds = dequeued.filter((id) => !BigNumber.from(id).isZero())
  let unexpiredDequeuedIds: string[] = []
  if (dequeuedIds.length) {
    const areExpired: boolean[] = await batchCall(
      governance,
      'isDequeuedProposalExpired',
      dequeuedIds
    )
    unexpiredDequeuedIds = dequeuedIds
      .filter((id, index) => !areExpired[index])
      .map((id) => BigNumber.from(id).toString())
  }

  const allIds = [...queuedIds, ...unexpiredDequeuedIds]
  const numProps = allIds.length
  if (!numProps) return []

  const metadatasP: Promise<ProposalRaw[]> = batchCall(governance, 'getProposal', allIds)
  const stagesP: Promise<ProposalStage[]> = batchCall(governance, 'getProposalStage', allIds)
  const votesP: Promise<VoteTotalsRaw[]> = batchCall(governance, 'getVoteTotals', allIds)
  const [metadatas, stages, votes] = await Promise.all([metadatasP, stagesP, votesP])

  if (numProps !== metadatas.length || numProps !== stages.length || numProps !== votes.length) {
    throw new Error('Proposal ID / proposal details length mismatch')
  }

  const proposals: Proposal[] = []
  for (let i = 0; i < numProps; i++) {
    const id = allIds[i]
    const metadata = metadatas[i]
    const stage = stages[i]
    const vote = votes[i]
    proposals.push({
      id,
      timestamp: BigNumber.from(metadata[2]).mul(1000).toNumber(),
      description: null,
      url: metadata[4],
      stage,
      votes: {
        [VoteValue.Yes]: vote[0].toString(),
        [VoteValue.No]: vote[1].toString(),
        [VoteValue.Abstain]: vote[2].toString(),
      },
    })
  }

  const descriptionsP = proposals.map((p) => fetchProposalDescription(p))
  const descriptions = await Promise.all(descriptionsP)
  for (let i = 0; i < numProps; i++) {
    proposals[i].description = descriptions[i]
  }

  return proposals
}

export const {
  name: fetchProposalsSagaName,
  wrappedSaga: fetchProposalsSaga,
  reducer: fetchProposalsReducer,
  actions: fetchProposalsActions,
} = createMonitoredSaga<FetchProposalsParams>(fetchProposals, 'fetchProposals')
