import { utils } from 'ethers'
import { Location } from 'history'
import { ChangeEvent, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { TextButton } from 'src/components/buttons/TextButton'
import { NumberInput } from 'src/components/input/NumberInput'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { StackedBarChart } from 'src/components/StackedBarChart'
import { Currency } from 'src/currency'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { getResultChartData, getSummaryChartData } from 'src/features/validators/barCharts'
import { validate } from 'src/features/validators/stakeToken'
import {
  stakeActionLabel,
  StakeActionType,
  StakeTokenParams,
  ValidatorGroup,
} from 'src/features/validators/types'
import { getStakingMaxAmount, getValidatorGroupName } from 'src/features/validators/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
import { amountFieldFromWei, amountFieldToWei, fromWeiRounded } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'

interface StakeTokenForm extends Omit<StakeTokenParams, 'amountInWei'> {
  amount: string
}

const initialValues: StakeTokenForm = {
  groupAddress: '',
  action: StakeActionType.Vote,
  amount: '',
}

const radioBoxLabels = [
  { value: StakeActionType.Vote, label: stakeActionLabel(StakeActionType.Vote) },
  { value: StakeActionType.Activate, label: stakeActionLabel(StakeActionType.Activate) },
  { value: StakeActionType.Revoke, label: stakeActionLabel(StakeActionType.Revoke) },
]

export function StakeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const tx = useSelector((state: RootState) => state.txFlow.transaction)
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const groups = useSelector((state: RootState) => state.validators.validatorGroups.groups)
  const groupVotes = useSelector((state: RootState) => state.validators.groupVotes)

  const onSubmit = (values: StakeTokenForm) => {
    dispatch(txFlowStarted({ type: TxFlowType.Stake, params: amountFieldToWei(values) }))
    navigate('/stake-review')
  }

  const validateForm = (values: StakeTokenForm) =>
    validate(amountFieldToWei(values), balances, groups, groupVotes)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  } = useCustomForm<StakeTokenForm>(getInitialValues(location, tx), onSubmit, validateForm)

  // Keep form in sync with tx state
  useEffect(() => {
    const initialValues = getInitialValues(location, tx)
    resetValues(initialValues)
    // Ensure we have the info needed otherwise send user back
    if (!groups || !groups.length) {
      navigate('/validators')
    }
  }, [tx])

  const onSelectAction = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    let autoSetAmount: string
    if (value === StakeActionType.Activate) {
      const maxAmount = getStakingMaxAmount(
        StakeActionType.Activate,
        balances,
        groupVotes,
        values.groupAddress
      )
      autoSetAmount = fromWeiRounded(maxAmount, Currency.CELO, true)
    } else {
      autoSetAmount = '0'
    }
    setValues({ ...values, [name]: value, amount: autoSetAmount })
  }

  const onUseMax = () => {
    const maxAmount = getStakingMaxAmount(values.action, balances, groupVotes, values.groupAddress)
    setValues({ ...values, amount: fromWeiRounded(maxAmount, Currency.CELO, true) })
  }

  const onGoBack = () => {
    navigate(-1)
  }

  const selectOptions = useMemo(() => getSelectOptions(groups), [groups])

  const summaryData = useMemo(() => getSummaryChartData(balances, groups, groupVotes), [
    balances,
    groups,
    groupVotes,
  ])
  const resultData = useMemo(
    () => getResultChartData(balances, groups, groupVotes, amountFieldToWei(values)),
    [balances, groups, groupVotes, values]
  )

  return (
    <ScreenContentFrame>
      <h1 css={Font.h2Green}>Vote for Validators</h1>
      <div css={style.container}>
        <div css={style.content}>
          <form onSubmit={handleSubmit}>
            <Box direction="column">
              <label css={style.inputLabel}>Validator Group</label>
              <SelectInput
                width="19em"
                name="groupAddress"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.groupAddress}
                options={selectOptions}
                disabled={true}
                {...errors['groupAddress']}
              />
            </Box>

            <Box direction="column" margin="1.5em 0 0 0">
              <label css={style.inputLabel}>Action</label>
              <RadioBoxRow
                value={values.action}
                startTabIndex={0}
                labels={radioBoxLabels}
                name="action"
                onChange={onSelectAction}
                margin="0.3em 0 0 -1.3em"
                containerStyles={style.radioBox}
              />
            </Box>

            <Box direction="column" justify="end" align="start" margin="1.5em 0 0 0">
              <label css={style.inputLabel}>Amount</label>
              <Box direction="row" align="center">
                <NumberInput
                  step="0.01"
                  width="12em"
                  margin="0 1.6em 0 0"
                  name="amount"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount.toString()}
                  placeholder="1.00"
                  disabled={values.action === StakeActionType.Activate}
                  {...errors['amount']}
                />
                <TextButton onClick={onUseMax} styles={style.maxAmountButton}>
                  Max Amount
                </TextButton>
              </Box>
            </Box>

            <Box direction="column" justify="end" align="start" margin="1.5em 0 0 0">
              <label css={style.inputLabel}>Result</label>
              <StackedBarChart
                data={resultData.data}
                total={resultData.total}
                showTotal={false}
                showLabels={true}
                width="20.25em"
              />
            </Box>

            <Box direction="row" margin="2em 0 0 0">
              <Button
                type="button"
                size="m"
                color={Color.altGrey}
                onClick={onGoBack}
                margin="0 5.4em 0 0"
                width="5em"
              >
                Back
              </Button>
              <Button type="submit" size="m" width="10em">
                Continue
              </Button>
            </Box>
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

function getInitialValues(location: Location<any>, tx: TxFlowTransaction | null): StakeTokenForm {
  const groupAddress = location?.state?.groupAddress
  const initialGroup = groupAddress && utils.isAddress(groupAddress) ? groupAddress : ''
  if (!tx || !tx.params || tx.type !== TxFlowType.Stake) {
    return {
      ...initialValues,
      groupAddress: initialGroup,
    }
  } else {
    return amountFieldFromWei(tx.params)
  }
}

function getSelectOptions(groups: ValidatorGroup[]) {
  return groups.map((g) => {
    const display = `${getValidatorGroupName(g, true)} - ${shortenAddress(g.address, true)}`
    return {
      display,
      value: g.address,
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
