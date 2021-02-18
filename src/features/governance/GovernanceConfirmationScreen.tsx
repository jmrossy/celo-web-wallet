import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { HelpIcon } from 'src/components/icons/HelpIcon'
import VoteIcon from 'src/components/icons/vote_small.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { governanceVoteActions } from 'src/features/governance/governanceVote'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function GovernanceConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)

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

  const { isWorking } = useTxFlowStatusModals(
    'governanceVote',
    1,
    'Sending Vote...',
    'Vote Registered!',
    'Your governance vote has been sent successfully',
    'Vote Failed',
    'Your vote could not be processed'
  )

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={style.h1}>Review Governance Vote</h1>

        <Box align="center" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Proposal</label>
          <Box direction="row" align="center" justify="end" styles={style.valueCol}>
            <div>{params.proposalId}</div>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Vote</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <div>{params.value}</div>
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow} align="end" justify="between">
          <Box
            direction="row"
            justify="between"
            align="end"
            styles={{ ...style.labelCol, width: '10em' }}
          >
            <label>
              Fee{' '}
              <HelpIcon
                tooltip={{
                  content: "Fees, or 'gas', keep the network secure.",
                  position: 'topRight',
                }}
              />
            </label>
          </Box>
          {feeAmount && feeCurrency ? (
            <Box justify="end" align="end" styles={style.valueCol}>
              <MoneyValue
                amountInWei={feeAmount}
                currency={feeCurrency}
                baseFontSize={1.2}
                margin="0 0 0 0.25em"
              />
            </Box>
          ) : (
            // TODO a proper loader (need to update mocks)
            <div css={style.valueCol}>...</div>
          )}
        </Box>

        <Box direction="row" justify="between" margin="3em 0 0 0">
          <Button
            type="button"
            size="m"
            color={Color.altGrey}
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
            disabled={isWorking || !feeAmount}
          >
            Send Vote
          </Button>
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '23em',
  },
  h1: {
    ...Font.h2Green,
    marginBottom: '2em',
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
  valueCol: {
    width: '12em',
    textAlign: 'end',
  },
}
