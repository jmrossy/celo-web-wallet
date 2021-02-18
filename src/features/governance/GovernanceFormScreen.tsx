import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import {
  fetchProposalsActions,
  fetchProposalsSagaName,
} from 'src/features/governance/fetchProposals'
import { validate } from 'src/features/governance/governanceVote'
import { GovernanceVoteParams, Proposal, VoteValue } from 'src/features/governance/types'
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

export function GovernanceFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const proposals = useSelector((state: RootState) => state.governance.proposals)

  useEffect(() => {
    dispatch(fetchProposalsActions.trigger({}))
  }, [])

  const status = useSagaStatus(
    fetchProposalsSagaName,
    'Error Finding Proposals',
    'Something went wrong when finding proposals, sorry! Please try again later.',
    undefined,
    false
  )

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

  const isReady = status === SagaStatus.Success && selectOptions.length > 0

  let inputPlaceholder = ''
  if (status === SagaStatus.Started) inputPlaceholder = 'Loading...'
  else if (isReady) inputPlaceholder = 'Select proposal'
  else inputPlaceholder = 'No active proposals found'

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
                placeholder={inputPlaceholder}
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
          justify="end"
          align="start"
          margin="0 0 1.5em 0"
          styles={style.currentSummaryContainer}
        >
          <label css={style.inputLabel}>Current Proposals</label>
        </Box>
      </div>
    </ScreenContentFrame>
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
  return [
    {
      display: 'my p1 thing hi',
      value: '1',
    },
    {
      display: 'and the next one',
      value: '2',
    },
  ]
  return proposals.map((p) => {
    const display = trimToLength(p.description, 30)
    return {
      display,
      value: p.id,
    }
  })
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
    background: Color.fillLighter,
    padding: '1.2em',
  },
}
