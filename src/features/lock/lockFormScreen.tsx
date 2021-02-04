import { BigNumber, BigNumberish } from 'ethers'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import { NumberInput } from 'src/components/input/NumberInput'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { StackedBarChart } from 'src/components/StackedBarChart'
import { Currency } from 'src/currency'
import { validate } from 'src/features/lock/lockToken'
import { LockActionType, LockTokenParams } from 'src/features/lock/types'
import {
  getTotalCelo,
  getTotalPendingCelo,
  getTotalUnlockedCelo,
  hasPendingCelo,
} from 'src/features/lock/utils'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Balances } from 'src/features/wallet/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
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
  { value: LockActionType.Lock, label: 'Lock' },
  { value: LockActionType.Unlock, label: 'Unlock' },
  { value: LockActionType.Withdraw, label: 'Withdraw' },
]

export function LockFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const tx = useSelector((state: RootState) => state.txFlow.transaction)

  const onSubmit = (values: LockTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Lock, params: amountFieldToWei(values) }))
    navigate('/lock-review')
  }

  const validateForm = (values: LockTokenForm) => validate(amountFieldToWei(values), balances)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  } = useCustomForm<LockTokenForm>(getInitialValues(tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(tx))
  }, [tx])

  const onUseMax = () => {
    const { locked, pendingFree } = balances.lockedCelo
    let maxAmount = '0'
    if (values.action === LockActionType.Lock) {
      maxAmount = fromWeiRounded(getTotalUnlockedCelo(balances), Currency.CELO, true)
    } else if (values.action === LockActionType.Unlock) {
      maxAmount = fromWeiRounded(locked, Currency.CELO, true)
    } else if (values.action === LockActionType.Withdraw) {
      maxAmount = fromWeiRounded(pendingFree, Currency.CELO, true)
    }
    setValues({ ...values, amount: maxAmount })
  }

  const summaryData = getSummaryChartData(balances)
  const resultData = getResultChartData(values, balances)

  return (
    <ScreenContentFrame>
      <h1 css={Font.h2Green}>Lock or Unlock CELO</h1>
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
                onChange={handleChange}
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

function getInitialValues(tx: TxFlowTransaction | null) {
  if (!tx || !tx.params || tx.type !== TxFlowType.Lock) {
    return initialValues
  } else {
    return amountFieldFromWei(tx.params)
  }
}

// Just for convinience / shortness cause this file has lots of conversions
function fromWei(value: BigNumberish) {
  return parseFloat(fromWeiRounded(value, Currency.CELO, true))
}

function getSummaryChartData(balances: Balances) {
  const hasPending = hasPendingCelo(balances)
  const total = getTotalCelo(balances)

  const unlocked = { label: 'Unlocked', value: fromWei(balances.celo), color: Color.primaryGold }
  const locked = {
    label: 'Locked',
    value: fromWei(balances.lockedCelo.locked),
    color: Color.altGrey,
    labelColor: Color.chartGrey,
  }
  const pending = hasPending
    ? [
        {
          label: 'Pending (Free)',
          value: fromWei(balances.lockedCelo.pendingFree),
          color: Color.chartBlueGreen,
        },
        {
          label: 'Pending (On Hold)',
          value: fromWei(balances.lockedCelo.pendingBlocked),
          color: Color.accentBlue,
        },
      ]
    : [
        {
          label: 'Pending',
          value: 0,
          color: Color.accentBlue,
        },
      ]

  return {
    data: [unlocked, ...pending, locked],
    total: { label: 'Total', value: fromWei(total) },
  }
}

function subtractTil0(v1: BigNumber, v2: BigNumberish) {
  if (v1.gt(v2)) return v1.sub(v2)
  else return BigNumber.from('0')
}

function addUpToMax(v1: BigNumber, toAdd: BigNumberish, max: BigNumberish) {
  if (BigNumber.from(toAdd).gt(max)) return v1.add(max)
  else return v1.add(toAdd)
}

function getResultChartData(values: LockTokenForm, balances: Balances) {
  let unlocked = BigNumber.from(balances.celo)
  let pending = getTotalPendingCelo(balances)
  let locked = BigNumber.from(balances.lockedCelo.locked)
  const total = getTotalCelo(balances)

  const valuesInWei = amountFieldToWei(values)
  const { action, amountInWei } = valuesInWei
  if (action === LockActionType.Lock) {
    locked = addUpToMax(locked, amountInWei, unlocked)
    unlocked = subtractTil0(unlocked, amountInWei)
  } else if (action === LockActionType.Unlock) {
    pending = addUpToMax(pending, amountInWei, locked)
    locked = subtractTil0(locked, amountInWei)
  } else if (action === LockActionType.Withdraw) {
    unlocked = addUpToMax(unlocked, amountInWei, pending)
    pending = subtractTil0(pending, amountInWei)
  }

  return {
    data: [
      { label: 'Unlocked', value: fromWei(unlocked), color: Color.primaryGold },
      {
        label: 'Pending',
        value: fromWei(pending),
        color: Color.accentBlue,
      },
      {
        label: 'Locked',
        value: fromWei(locked),
        color: Color.altGrey,
        labelColor: Color.chartGrey,
      },
    ],
    total: { label: 'Total', value: fromWei(total) },
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
    padding: '1.2em',
  },
}
