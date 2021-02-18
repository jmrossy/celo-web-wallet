import { BigNumberish } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { PROPOSAL_LIST_STALE_TIME } from 'src/consts'
import { createMonitoredSaga } from 'src/utils/saga'
import { isStale } from 'src/utils/time'
import { call, select } from 'typed-redux-saga'

// proposer, deposit, timestamp, txLength, url
type ProposalRaw = [string, BigNumberish, BigNumberish, BigNumberish, string]

// Yes, no, abstain
type VoteTotalsRaw = [BigNumberish, BigNumberish, BigNumberish]

interface FetchProposalsParams {
  force?: boolean
}

function* fetchProposals({ force }: FetchProposalsParams) {
  const { proposals, lastUpdated } = yield* select((state: RootState) => state.governance)

  if (
    force ||
    !proposals.length ||
    !lastUpdated ||
    isStale(lastUpdated, PROPOSAL_LIST_STALE_TIME)
  ) {
    const proposals = yield* call(fetchCurrentProposals)
    //TODO
    // yield* put(updateProposals({ proposals, lastUpdated: Date.now() }))
  }
}

async function fetchCurrentProposals() {
  //getQueue => [BigNumberish[], BigNumberish[]] //IDs then upvotes
  // isQueuedProposalExpired to find which queued are expired
  // getDequeue => string[] // IDs
  // filter dequeued 0s, those are deleted proposals
  // isDequeuedProposalExpired to find which dequeued are expired
  // getProposalStage => ProposalStage
  // getProposal => ProposalRaw
  // getVoteTotals => VoteTotalsRaw
}

export const {
  name: fetchProposalsSagaName,
  wrappedSaga: fetchProposalsSaga,
  reducer: fetchProposalsReducer,
  actions: fetchProposalsActions,
} = createMonitoredSaga<FetchProposalsParams>(fetchProposals, 'fetchProposals')
