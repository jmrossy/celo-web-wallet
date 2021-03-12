import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import LockIcon from 'src/components/icons/lock_small.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { StackedBarChart } from 'src/components/StackedBarChart'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { FeeHelpIcon } from 'src/features/fees/FeeHelpIcon'
import { useFee } from 'src/features/fees/utils'
import { getResultChartData } from 'src/features/lock/barCharts'
import { getLockActionTxPlan, lockTokenActions } from 'src/features/lock/lockToken'
import { lockActionLabel } from 'src/features/lock/types'
import { txFlowCanceled } from 'src/features/txFlow/txFlowSlice'
import { TxFlowType } from 'src/features/txFlow/types'
import { useTxFlowStatusModals } from 'src/features/txFlow/useTxFlowStatusModals'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'

export function LockConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const pendingWithdrawals = useSelector((state: RootState) => state.lock.pendingWithdrawals)
  const isAccountRegistered = useSelector((state: RootState) => state.wallet.account.isRegistered)

  useEffect(() => {
    // Make sure we belong on this screen
    if (!tx || tx.type !== TxFlowType.Lock) {
      navigate('/lock')
      return
    }

    const txs = getLockActionTxPlan(tx.params, pendingWithdrawals, balances, isAccountRegistered)
    dispatch(estimateFeeActions.trigger({ txs }))
  }, [tx])

  if (!tx || tx.type !== TxFlowType.Lock) return null

  const params = tx.params
  const { action, amountInWei } = params
  const txPlan = getLockActionTxPlan(params, pendingWithdrawals, balances, isAccountRegistered)

  const { amount, feeAmount, feeCurrency, feeEstimates } = useFee(amountInWei, txPlan.length)

  const onGoBack = () => {
    dispatch(lockTokenActions.reset())
    dispatch(txFlowCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(lockTokenActions.trigger({ ...params, feeEstimates }))
  }

  const { isWorking } = useTxFlowStatusModals(
    'lockToken',
    txPlan.length,
    `${lockActionLabel(action, true)} CELO...`,
    `${lockActionLabel(action)} Complete!`,
    `Your ${lockActionLabel(action)} request was successful`,
    `${lockActionLabel(action)} Failed`,
    `Your ${lockActionLabel(action)} request could not be processed`,
    txPlan.length > 1
      ? [
          `${lockActionLabel(action)} requests sometimes need several transactions`,
          'Confirm all transactions on your Ledger',
        ]
      : undefined
  )

  const resultData = useMemo(() => getResultChartData(balances, params), [balances, params])

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>{`Review ${lockActionLabel(action)} Request`}</h1>

        <Box direction="row" styles={style.inputRow} justify="between">
          <label css={style.labelCol}>Action</label>
          <label css={[style.valueLabel, style.valueCol]}>{lockActionLabel(action)}</label>
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
            width="5em"
            margin="0 2em 0 0"
            color={Color.altGrey}
            onClick={onGoBack}
            disabled={isWorking || !feeAmount}
          >
            Back
          </Button>
          <Button
            type="submit"
            size="m"
            width="10em"
            onClick={onSend}
            icon={LockIcon}
            iconStyles={style.buttonIcon}
            disabled={isWorking || !feeAmount}
          >
            {lockActionLabel(action)}
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
  buttonIcon: {
    height: '1em',
    position: 'relative',
    top: -1,
  },
}
