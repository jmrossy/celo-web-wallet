import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../../app/rootReducer'
import { Button } from '../../components/buttons/Button'
import VoteIcon from '../../components/icons/vote_small.svg'
import { Box } from '../../components/layout/Box'
import { ScreenContentFrame } from '../../components/layout/ScreenContentFrame'
import { MoneyValue } from '../../components/MoneyValue'
import { estimateFeeActions } from '../fees/estimateFee'
import { FeeHelpIcon } from '../fees/FeeHelpIcon'
import { useFee } from '../fees/utils'
import { governanceVoteActions, governanceVoteSagaName } from './governanceVote'
import { Proposal, voteValueToLabel } from './types'
import { txFlowCanceled } from '../txFlow/txFlowSlice'
import { TxFlowType } from '../txFlow/types'
import { useTxFlowStatusModals } from '../txFlow/useTxFlowStatusModals'
import { TransactionType } from '../types'
import { VotingForBanner } from '../wallet/accounts/VotingForBanner'
import { Color } from '../../styles/Color'
import { Font } from '../../styles/fonts'
import { mq } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'
import { trimToLength } from '../../utils/string'

export function GovernanceConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const proposals = useSelector((state: RootState) => state.governance.proposals)

  useEffect(() => {
    // Make sure we belong on this screen
    if (!tx || tx.type !== TxFlowType.Governance) {
      navigate('/governance')
      return
    }

    dispatch(estimateFeeActions.trigger({ txs: [{ type: TransactionType.GovernanceVote }] }))
  }, [tx])

  if (!tx || tx.type !== TxFlowType.Governance) return null
  const params = tx.params

  const { feeAmount, feeCurrency, feeEstimates } = useFee('0')

  const onGoBack = () => {
    dispatch(governanceVoteActions.reset())
    dispatch(txFlowCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(governanceVoteActions.trigger({ ...params, feeEstimate: feeEstimates[0] }))
  }

  const { isWorking } = useTxFlowStatusModals({
    sagaName: governanceVoteSagaName,
    signaturesNeeded: 1,
    loadingTitle: 'Sending Vote...',
    successTitle: 'Vote Sent!',
    successMsg: 'Your vote has been cast successfully',
    errorTitle: 'Vote Failed',
    errorMsg: 'Your vote could not be processed',
  })

  const description = findProposalDescription(params.proposalId, proposals)

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={style.h1}>Review Governance Vote</h1>
        <VotingForBanner />
        <h2 css={style.h2}>{description}</h2>

        <Box align="center" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Proposal Id</label>
          <label css={[style.valueLabel, style.valueCol]}>{params.proposalId}</label>
        </Box>

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Vote</label>
          <label css={[style.valueLabel, style.valueCol]}>{voteValueToLabel(params.value)}</label>
        </Box>

        <Box direction="row" styles={style.inputRow} align="end" justify="between">
          <Box
            direction="row"
            justify="between"
            align="end"
            styles={{ ...style.labelCol, width: '10em' }}
          >
            <label>
              Fee <FeeHelpIcon />
            </label>
          </Box>
          {feeAmount && feeCurrency ? (
            <Box justify="end" align="end" styles={style.valueCol}>
              <MoneyValue
                amountInWei={feeAmount}
                token={feeCurrency}
                baseFontSize={1.2}
                margin="0 0 0 0.25em"
              />
            </Box>
          ) : (
            // TODO a proper loader (need to update mocks)
            <div css={style.valueCol}>...</div>
          )}
        </Box>

        <Box direction="row" justify="between" margin="2.7em 0 0 0">
          <Button
            type="button"
            size="m"
            color={Color.primaryWhite}
            onClick={onGoBack}
            disabled={isWorking || !feeAmount}
            margin="0 2em 0 0"
            width="5em"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="m"
            onClick={onSend}
            icon={VoteIcon}
            iconStyles={style.buttonIcon}
            disabled={isWorking || !feeAmount}
          >
            Send Vote
          </Button>
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

function findProposalDescription(id: string, proposals: Proposal[]) {
  const proposal = proposals.find((p) => p.id === id)
  if (!proposal) return ''
  const description = proposal.description || 'Unknown proposal'
  return trimToLength(description, 100)
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '23em',
  },
  h1: {
    ...Font.h2Green,
    margin: 0,
  },
  h2: {
    fontSize: '1.1em',
    fontWeight: 400,
    margin: '1.5em 0',
  },
  inputRow: {
    marginBottom: '1.8em',
    [mq[1200]]: {
      marginBottom: '2em',
    },
  },
  labelCol: {
    ...Font.inputLabel,
    color: Color.primaryGrey,
    width: '9em',
    marginRight: '1em',
    [mq[1200]]: {
      width: '11em',
    },
  },
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: '1.2em',
    fontWeight: 400,
  },
  valueCol: {
    width: '12em',
    textAlign: 'end',
  },
  buttonIcon: {
    height: '1em',
    position: 'relative',
    top: -2,
  },
}
