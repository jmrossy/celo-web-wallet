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
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { getCurrencyBalance } from 'src/features/wallet/utils'
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
    // TODO diff things for diff actions
    const balance = getCurrencyBalance(balances, Currency.CELO)
    const maxAmount = fromWeiRounded(balance, Currency.CELO, true)
    setValues({ ...values, amount: maxAmount })
  }

  const stackedBarResult = {
    data: [
      { label: 'Locked CELO', value: 100, color: Color.primaryGold },
      { label: 'Pending CELO', value: 20, color: Color.accentBlue },
    ],
    total: { label: 'Total CELO', value: 200, color: Color.primaryBlack },
  }

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <form onSubmit={handleSubmit}>
          <h1 css={Font.h2Green}>Lock or Unlock CELO</h1>

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
              data={stackedBarResult.data}
              total={stackedBarResult.total}
              showTotal={true}
              showLabels={true}
              showRemaining={true}
              remainingLabel="Unlocked CELO"
              width="19.25em"
            />
          </Box>

          <Button type="submit" size="m" margin="2.5em 1em 0 0">
            Continue
          </Button>
        </form>
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

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '26em',
    paddingBottom: '1em',
  },
  inputLabel: {
    ...Font.inputLabel,
    marginBottom: '0.5em',
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
}
