import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import CubeIcon from 'src/components/icons/cube.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { StackedBarChart } from 'src/components/StackedBarChart'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { FeeHelpIcon } from 'src/features/fees/FeeHelpIcon'
import { useFee } from 'src/features/fees/utils'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { getResultChartData } from 'src/features/validators/barCharts'
import {
  getStakeActionTxPlan,
  stakeTokenActions,
  stakeTokenSagaName,
} from 'src/features/validators/stakeToken'
import { stakeActionLabel, StakeActionType } from 'src/features/validators/types'
import { VotingForBanner } from 'src/features/wallet/accounts/VotingForBanner'
import { useVoterAccountAddress, useVoterBalances } from 'src/features/wallet/hooks'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'

export function StakeConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const { voterBalances } = useVoterBalances()
  const voterAddress = useVoterAccountAddress()
  const groups = useSelector((state: RootState) => state.validators.validatorGroups.groups)
  const groupVotes = useSelector((state: RootState) => state.validators.groupVotes)

  useEffect(() => {
    // Make sure we belong on this screen
    if (!tx || tx.type !== TxFlowType.Stake) {
      navigate('/stake')
      return
    }

    const txs = getStakeActionTxPlan(tx.params, voterAddress, voterBalances, groupVotes)
    dispatch(estimateFeeActions.trigger({ txs }))
  }, [tx])

  if (!tx || tx.type !== TxFlowType.Stake) return null

  const params = tx.params
  const { action, amountInWei } = params
  const txPlan = getStakeActionTxPlan(tx.params, voterAddress, voterBalances, groupVotes)

  const { amount, feeAmount, feeCurrency, feeEstimates } = useFee(amountInWei, txPlan.length)

  const onGoBack = () => {
    dispatch(stakeTokenActions.reset())
    dispatch(txFlowCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(stakeTokenActions.trigger({ ...params, feeEstimates }))
  }

  const { isWorking } = useTxFlowStatusModals({
    sagaName: stakeTokenSagaName,
    signaturesNeeded: txPlan.length,
    loadingTitle: `${stakeActionLabel(action, true)}...`,
    successTitle: `${stakeActionLabel(action)} Complete!`,
    successMsg: `Your ${stakeActionLabel(action)} request was successful`,
    errorTitle: `${stakeActionLabel(action)} Failed`,
    errorMsg: `Your ${stakeActionLabel(action)} request could not be processed`,
    reqSignatureMsg:
      txPlan.length > 1
        ? [
            `${stakeActionLabel(action)} requests sometimes need several transactions`,
            'Confirm all transactions on your Ledger',
          ]
        : undefined,
    customSuccessModal:
      action === StakeActionType.Vote
        ? { title: "You're Almost Done!", content: <SuccessModal /> }
        : undefined,
  })

  const resultData = useMemo(
    () => getResultChartData(voterBalances, groups, groupVotes, params),
    [voterBalances, groups, groupVotes, params]
  )

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={style.h1}>{`Review ${stakeActionLabel(action)} Request`}</h1>
        <VotingForBanner />

        <Box direction="row" styles={style.inputRow} justify="between" margin="1.5em 0 0 0">
          <label css={style.labelCol}>Action</label>
          <label css={[style.valueLabel, style.valueCol]}>{stakeActionLabel(action)}</label>
        </Box>

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Value</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue amountInWei={amount} token={CELO} baseFontSize={1.2} />
          </Box>
        </Box>

        <Box
          direction="row"
          styles={{ ...style.inputRow, ...style.bottomBorder }}
          align="end"
          justify="between"
        >
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

        <div css={style.inputRow}>
          <StackedBarChart
            data={resultData.data}
            total={resultData.total}
            showTotal={false}
            showLabels={true}
            width="23em"
          />
        </div>

        <Box direction="row" justify="between" margin="3em 0 0 0">
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
            width="10em"
            onClick={onSend}
            icon={CubeIcon}
            iconStyles={{ height: '1em' }}
            disabled={isWorking || !feeAmount}
          >
            {stakeActionLabel(action)}
          </Button>
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

function SuccessModal() {
  return (
    <div css={style.successModal}>
      <div>
        Validator votes <strong>must be activated</strong> around 24 hours after voting.
      </div>
      <div>Return tomorrow to activate your votes and start earning rewards!</div>
    </div>
  )
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
  inputRow: {
    marginBottom: '1.4em',
    [mq[1200]]: {
      marginBottom: '1.6em',
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
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: '1.2em',
    fontWeight: 400,
  },
  bottomBorder: {
    paddingBottom: '1.25em',
    borderBottom: `1px solid ${Color.borderMedium}`,
  },
  successModal: {
    fontSize: '1.1em',
    textAlign: 'center',
    maxWidth: '20em',
    div: {
      marginTop: '1em',
    },
  },
}
