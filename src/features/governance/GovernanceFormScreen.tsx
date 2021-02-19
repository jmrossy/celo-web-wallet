import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { Spinner } from 'src/components/Spinner'
import {
  fetchProposalsActions,
  fetchProposalsSagaName,
} from 'src/features/governance/fetchProposals'
import { validate } from 'src/features/governance/governanceVote'
import {
  GovernanceVoteParams,
  Proposal,
  ProposalStage,
  VoteValue,
} from 'src/features/governance/types'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { trimToLength } from 'src/utils/string'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: GovernanceVoteParams = {
  proposalId: '',
  value: VoteValue.Yes,
}

const radioBoxLabels = [
  { value: VoteValue.Yes, label: 'Yes' },
  { value: VoteValue.No, label: 'No' },
  { value: VoteValue.Abstain, label: 'Abstain' },
]

enum Status {
  Loading,
  Ready,
  ReadyEmpty, // no proposals found
  Error,
}

export function GovernanceFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const proposals = useSelector((state: RootState) => state.governance.proposals)

  useEffect(() => {
    dispatch(fetchProposalsActions.trigger({}))
  }, [])

  const sagaStatus = useSagaStatus(
    fetchProposalsSagaName,
    'Error Finding Proposals',
    'Something went wrong when finding proposals, sorry! Please try again later.',
    undefined,
    false
  )
  const status = getFormStatus(sagaStatus, proposals)
  const isReady = status === Status.Ready

  const onSubmit = (values: GovernanceVoteParams) => {
    dispatch(txFlowStarted({ type: TxFlowType.Governance, params: values }))
    navigate('/governance-review')
  }

  const validateForm = (values: GovernanceVoteParams) => validate(values, balances)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetValues,
  } = useCustomForm<GovernanceVoteParams>(getInitialValues(tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    const initialValues = getInitialValues(tx)
    resetValues(initialValues)
  }, [tx])

  const selectOptions = useMemo(() => getSelectOptions(proposals), [proposals])

  return (
    <ScreenContentFrame>
      <h1 css={Font.h2Green}>Vote for Governance Proposals</h1>
      <div css={style.container}>
        <div css={style.content}>
          <form onSubmit={handleSubmit}>
            <Box direction="column">
              <label css={style.inputLabel}>Proposal</label>
              <SelectInput
                name="proposalId"
                autoComplete={false}
                width="19em"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.proposalId}
                options={selectOptions}
                disabled={!isReady}
                placeholder={getSelectPlaceholder(status)}
                {...errors['proposalId']}
              />
            </Box>

            <Box direction="column" margin="2.5em 0 0 0">
              <label css={style.inputLabel}>Vote</label>
              <RadioBoxRow
                value={values.value}
                startTabIndex={1}
                labels={radioBoxLabels}
                name="value"
                onChange={handleChange}
                margin="0.1em 0 0 -1.3em"
                containerStyles={style.radioBox}
              />
            </Box>

            <Button type="submit" size="m" margin="3.5em 0 0 0" disabled={!isReady}>
              Continue
            </Button>
          </form>
        </div>
        <Box
          direction="column"
          align="start"
          margin="0 0 1.5em 0"
          styles={style.currentSummaryContainer}
        >
          {getSummaryPaneContent(status, proposals, values.proposalId)}
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

function getSummaryPaneContent(status: Status, proposals: Proposal[], selectedId: string) {
  if (status === Status.Loading) {
    return (
      <div css={style.spinner}>
        <Spinner />
      </div>
    )
  }

  if (selectedId) {
    const proposal = proposals.find((p) => p.id === selectedId)
    if (proposal) return <ProposalDetails proposal={proposal} />
  }

  return <ProposalsSummary proposals={proposals} />
}

function ProposalsSummary({ proposals }: { proposals: Proposal[] }) {
  const upcomingCount = proposals.filter(
    (p) => p.stage === ProposalStage.Queued || p.stage === ProposalStage.Approval
  ).length
  const activeCount = proposals.filter((p) => p.stage === ProposalStage.Referendum).length
  const helpText =
    upcomingCount + activeCount > 0
      ? 'Choose a proposal to see details'
      : 'There are currently no pending proposals'

  return (
    <>
      <label css={style.inputLabel}>Current Proposals</label>
      <Box direction="row" margin="0.5em 0 0.7em 0">
        <div css={{ marginRight: '3em' }}>
          <div css={style.proposalCount}>{upcomingCount}</div>
          <div css={style.proposalCountLabel}>upcoming</div>
        </div>
        <div>
          <div css={style.proposalCount}>{activeCount}</div>
          <div css={style.proposalCountLabel}>active</div>
        </div>
      </Box>
      <div css={style.proposalTip}>{helpText}</div>
      <div css={style.proposalTip}>
        For past proposals, see <TextLink link="https://celo.stake.id">celo.stake.id</TextLink> or{' '}
        <TextLink link="https://thecelo.com">thecelo.com</TextLink>
      </div>
    </>
  )
}

function ProposalDetails({ proposal }: { proposal: Proposal }) {
  return (
    <>
      <label css={style.inputLabel}>Proposal Details</label>
      <Box direction="row" margin="0.5em 0 0.7em 0">
        <div>{JSON.stringify(proposal.votes)}</div>
      </Box>
      <div css={style.proposalTip}>
        <TextLink link={proposal.url}>See proposal details</TextLink>
      </div>
    </>
  )
}

function getInitialValues(tx: TxFlowTransaction | null): GovernanceVoteParams {
  if (!tx || !tx.params || tx.type !== TxFlowType.Governance) {
    return initialValues
  } else {
    return tx.params
  }
}

function getSelectOptions(proposals: Proposal[]) {
  return proposals.map((p) => {
    const display = getProposalDescription(p)
    return {
      display,
      value: p.id,
    }
  })
}

function getProposalDescription(proposal: Proposal) {
  const description = proposal.description || 'Unknown proposal'
  return trimToLength(description, 30)
}

function getFormStatus(sagaStatus: SagaStatus | null, proposals: Proposal[]): Status {
  if (!sagaStatus || sagaStatus === SagaStatus.Started) return Status.Loading
  if (sagaStatus === SagaStatus.Failure) return Status.Error
  if (!proposals.length) return Status.ReadyEmpty
  else return Status.Ready
}

function getSelectPlaceholder(status: Status) {
  switch (status) {
    case Status.Loading:
      return 'Loading...'
    case Status.Error:
      return ''
    case Status.Ready:
      return 'Select proposal'
    case Status.ReadyEmpty:
      return 'No active proposals found'
    default:
      return ''
  }
}

const style: Stylesheet = {
  container: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    [mq[1024]]: {
      marginTop: '0.5em',
      flexDirection: 'row',
    },
  },
  content: {
    width: '100%',
    maxWidth: '26em',
    paddingBottom: '1em',
  },
  inputLabel: {
    ...Font.inputLabel,
    marginBottom: '1em',
  },
  radioBox: {
    justifyContent: 'flex-start',
  },
  currentSummaryContainer: {
    padding: '1.6em',
    minWidth: '22em',
    minHeight: '13em',
    background: Color.fillLighter,
    [mq[1024]]: {
      marginTop: '-0.75em',
    },
  },
  spinner: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '2.5em 0',
    opacity: 0.7,
    transform: 'scale(0.75)',
  },
  proposalCount: {
    fontSize: '2.6em',
    display: 'inline-block',
    marginRight: '0.15em',
  },
  proposalCountLabel: {
    ...Font.bold,
    display: 'inline-block',
    position: 'relative',
    top: -2,
  },
  proposalTip: {
    marginTop: '1.4em',
  },
}
