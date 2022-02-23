import { ChangeEvent, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import { NumberInput } from 'src/components/input/NumberInput'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useNavHintModal } from 'src/components/modal/useNavHintModal'
import { StackedBarChart } from 'src/components/StackedBarChart'
import { useBalances } from 'src/features/balances/hooks'
import { getResultChartData, getSummaryChartData } from 'src/features/lock/barCharts'
import { validate } from 'src/features/lock/lockToken'
import { lockActionLabel, LockActionType, LockTokenParams } from 'src/features/lock/types'
import { getTotalUnlockedCelo } from 'src/features/lock/utils'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'

interface LockTokenForm extends Omit<LockTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: LockTokenForm = {
  action: LockActionType.Lock,
  amount: '',
}

const radioBoxLabels = [
  { value: LockActionType.Lock, label: lockActionLabel(LockActionType.Lock) },
  { value: LockActionType.Unlock, label: lockActionLabel(LockActionType.Unlock) },
  { value: LockActionType.Withdraw, label: lockActionLabel(LockActionType.Withdraw) },
]

export function LockFormScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const balances = useBalances()
  const pendingWithdrawals = useAppSelector((state) => state.lock.pendingWithdrawals)
  const groupVotes = useAppSelector((state) => state.validators.groupVotes)
  const tx = useFlowTransaction()

  const onSubmit = (values: LockTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Lock, params: amountFieldToWei(values) }))
    navigate('/lock-review')
  }

  const validateForm = (values: LockTokenForm) =>
    validate(amountFieldToWei(values), balances, groupVotes)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
    resetErrors,
  } = useCustomForm<LockTokenForm>(getInitialValues(tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(tx))
  }, [tx])

  // Show modal to recommend nav to stake form when unlocking staked CELO
  const helpText = `You can't unlock CELO that's currently staked with validators. You must revoke votes first. Would you like to change your votes now?`
  useNavHintModal(errors.stakedCelo, 'Funds Are Still Voting', helpText, 'Change Votes', '/stake')

  const onSelectAction = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    let autoSetAmount: string
    if (value === LockActionType.Withdraw) {
      autoSetAmount = fromWeiRounded(balances.lockedCelo.pendingFree, CELO, true)
    } else {
      autoSetAmount = '0'
    }
    setValues({ ...values, [name]: value, amount: autoSetAmount })
    resetErrors()
  }

  const onUseMax = () => {
    const { locked, pendingFree } = balances.lockedCelo
    let maxAmount = '0'
    if (values.action === LockActionType.Lock) {
      maxAmount = fromWeiRounded(getTotalUnlockedCelo(balances), CELO, true)
    } else if (values.action === LockActionType.Unlock) {
      maxAmount = fromWeiRounded(locked, CELO, true)
    } else if (values.action === LockActionType.Withdraw) {
      maxAmount = fromWeiRounded(pendingFree, CELO, true)
    }
    setValues({ ...values, amount: maxAmount })
    resetErrors()
  }

  const summaryData = useMemo(
    () => getSummaryChartData(balances, pendingWithdrawals),
    [balances, pendingWithdrawals]
  )
  const resultData = useMemo(
    () => getResultChartData(balances, amountFieldToWei(values)),
    [balances, values]
  )

  return (
    <ScreenContentFrame>
      <h1 css={Font.h2Green}>
        Lock or Unlock CELO <HelpButton />
      </h1>
      <div css={style.container}>
        <div css={style.content}>
          <form onSubmit={handleSubmit}>
            <Box direction="column">
              <label css={style.inputLabel}>Action</label>
              <RadioBoxRow
                value={values.action}
                startTabIndex={0}
                labels={radioBoxLabels}
                name="action"
                onChange={onSelectAction}
                margin="0.5em 0 0 -1.3em"
                containerStyles={style.radioBox}
              />
            </Box>

            <Box direction="column" justify="end" align="start" margin="2em 0 0 0">
              <label css={style.inputLabel}>Amount</label>
              <Box direction="row" align="center">
                <NumberInput
                  step="0.01"
                  width="11em"
                  margin="0 1.6em 0 0"
                  name="amount"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount.toString()}
                  placeholder="1.00"
                  disabled={values.action === LockActionType.Withdraw}
                  {...errors['amount']}
                />
                <TextButton onClick={onUseMax} styles={style.maxAmountButton}>
                  Max Amount
                </TextButton>
              </Box>
            </Box>

            <Box direction="column" justify="end" align="start" margin="2em 0 0 0">
              <label css={style.inputLabel}>Result</label>
              <StackedBarChart
                data={resultData.data}
                total={resultData.total}
                showTotal={false}
                showLabels={true}
                width="19.25em"
              />
            </Box>

            <Button type="submit" size="m" margin="2.5em 1em 0 0">
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
          <label css={style.inputLabel}>Current Summary</label>
          <StackedBarChart
            data={summaryData.data}
            total={summaryData.total}
            showTotal={true}
            showLabels={true}
            width="18em"
          />
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

function HelpButton() {
  return (
    <HelpIcon
      width="1em"
      modal={{ head: 'About Locking', content: <HelpModal /> }}
      margin="0 0 0 0.4em"
    />
  )
}

function HelpModal() {
  return (
    <BasicHelpIconModal>
      <p>
        In order to vote on validator elections or governance proposals, you first need to lock some
        CELO.
      </p>
      <p>
        Locked funds can always be unlocked again but require a 3 day waiting period before you can
        withdraw.
      </p>
    </BasicHelpIconModal>
  )
}

function getInitialValues(tx: TxFlowTransaction | null) {
  if (!tx || !tx.params || tx.type !== TxFlowType.Lock) {
    return initialValues
  } else {
    return amountFieldFromWei(tx.params)
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
    marginBottom: '0.6em',
  },
  radioBox: {
    justifyContent: 'flex-start',
  },
  maxAmountButton: {
    fontWeight: 300,
    fontSize: '0.9em',
    [mq[768]]: {
      fontSize: '1em',
    },
  },
  currentSummaryContainer: {
    background: Color.fillLighter,
    borderRadius: 6,
    padding: '1.2em',
  },
}
