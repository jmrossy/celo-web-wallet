import { ChangeEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import { NumberInput } from 'src/components/input/NumberInput'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Currency } from 'src/currency'
import { getTotalUnlockedCelo } from 'src/features/lock/utils'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { validate } from 'src/features/validators/stakeToken'
import { stakeActionLabel, StakeActionType, StakeTokenParams } from 'src/features/validators/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'

interface StakeTokenForm extends Omit<StakeTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: StakeTokenForm = {
  action: StakeActionType.Vote,
  amount: '',
}

const radioBoxLabels = [
  { value: StakeActionType.Vote, label: stakeActionLabel(StakeActionType.Vote) },
  { value: StakeActionType.Revoke, label: stakeActionLabel(StakeActionType.Revoke) },
]

export function StakeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const tx = useSelector((state: RootState) => state.txFlow.transaction)

  const onSubmit = (values: StakeTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Stake, params: amountFieldToWei(values) }))
    navigate('/stake-review')
  }

  const validateForm = (values: StakeTokenForm) => validate(amountFieldToWei(values), balances)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  } = useCustomForm<StakeTokenForm>(getInitialValues(tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialValues(tx))
  }, [tx])

  const onSelectAction = (event: ChangeEvent<HTMLInputElement>) => {
    const maxAmount = fromWeiRounded(balances.lockedCelo.pendingFree, Currency.CELO, true)
    const { name, value } = event.target
    setValues({ ...values, [name]: value, amount: maxAmount })
  }

  const onUseMax = () => {
    const { locked, pendingFree } = balances.lockedCelo
    let maxAmount = '0'
    if (values.action === StakeActionType.Vote) {
      maxAmount = fromWeiRounded(getTotalUnlockedCelo(balances), Currency.CELO, true)
    } else if (values.action === StakeActionType.Revoke) {
      maxAmount = fromWeiRounded(locked, Currency.CELO, true)
    }
    setValues({ ...values, amount: maxAmount })
  }

  // const summaryData = getSummaryChartData(balances)
  // const resultData = getResultChartData(amountFieldToWei(values), balances)

  return (
    <ScreenContentFrame>
      <h1 css={Font.h2Green}>Vote for Validators</h1>
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
                  {...errors['amount']}
                />
                <TextButton onClick={onUseMax} styles={style.maxAmountButton}>
                  Max Amount
                </TextButton>
              </Box>
            </Box>

            <Box direction="column" justify="end" align="start" margin="2em 0 0 0">
              <label css={style.inputLabel}>Result</label>
              {/* <StackedBarChart
                data={resultData.data}
                total={resultData.total}
                showTotal={false}
                showLabels={true}
                width="19.25em"
              /> */}
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
          {/* <StackedBarChart
            data={summaryData.data}
            total={summaryData.total}
            showTotal={true}
            showLabels={true}
            width="18em"
          /> */}
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

function getInitialValues(tx: TxFlowTransaction | null) {
  if (!tx || !tx.params || tx.type !== TxFlowType.Stake) {
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
    padding: '1.2em',
  },
}
