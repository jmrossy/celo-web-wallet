import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import ReactFrappeChart from 'react-frappe-charts'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { HrDivider } from 'src/components/HrDivider'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Spinner } from 'src/components/Spinner'
import { Table, TableColumn } from 'src/components/Table'
import { computeStakingRewards } from 'src/features/validators/computeRewards'
import {
  fetchStakeHistoryActions,
  fetchStakeHistorySagaName,
} from 'src/features/validators/fetchStakeHistory'
import {
  fetchValidatorsActions,
  fetchValidatorsSagaName,
} from 'src/features/validators/fetchValidators'
import {
  GroupVotes,
  StakeEvent,
  StakeEventTableRow,
  ValidatorGroup,
} from 'src/features/validators/types'
import { findValidatorGroupName } from 'src/features/validators/utils'
import { VotingForBanner } from 'src/features/wallet/accounts/VotingForBanner'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { fromWei } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'
import { toTitleCase } from 'src/utils/string'
import { useSagaStatus } from 'src/utils/useSagaStatus'

const ALL_VALIDATORS = 'all'
const CHART_HEIGHT = 200

export function StakeRewardsScreen() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchValidatorsActions.trigger({}))
    dispatch(fetchStakeHistoryActions.trigger())
  }, [])

  const navigate = useNavigate()
  const onClickSeeVotes = () => {
    navigate('/stake')
  }

  const [validator, setValidator] = useState<string>(ALL_VALIDATORS)
  const onChangeSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setValidator(value)
  }

  const groups = useSelector(
    (state: RootState) => state.validators.validatorGroups.groups,
    shallowEqual
  )
  const groupVotes = useSelector((state: RootState) => state.validators.groupVotes)
  const stakeEvents = useSelector((state: RootState) => state.validators.stakeEvents.events)

  const selectOptions = useMemo(() => getSelectOptions(stakeEvents, groups), [stakeEvents, groups])
  const tableData = useMemo(() => {
    return stakeEventsToTableData(stakeEvents, groups, validator)
  }, [stakeEvents, groups, validator])

  const [mode, setMode] = useState<'amount' | 'apy'>('amount')
  const onToggleMode = (index: number) => {
    setMode(index === 0 ? 'amount' : 'apy')
  }

  const fetchValidatorStatus = useSagaStatus(
    fetchValidatorsSagaName,
    'Error Fetching Validator Info',
    'Something went wrong when finding validators, sorry! Please try again later.'
  )

  const fetchHistoryStatus = useSagaStatus(
    fetchStakeHistorySagaName,
    'Error Fetching Staking History',
    'Something went wrong when finding your staking history, sorry! Please try again later.'
  )

  const isLoading =
    fetchValidatorStatus === SagaStatus.Started || fetchHistoryStatus === SagaStatus.Started

  const chartData = useMemo(
    () => computeChartData(stakeEvents, groupVotes, groups, mode),
    [stakeEvents, groupVotes, groups, mode]
  )
  const hasChartData = chartData.labels.length > 0

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>
          Track Staking Rewards <HelpButton />
        </h1>
        <VotingForBanner />
        <Box direction="row" align="end" justify="between" margin="1.6em 1.5em 0.2em 0">
          <ButtonToggle label1="Amount" label2="APY" onToggle={onToggleMode} />
          <Button size="s" styles={style.voteButton} onClick={onClickSeeVotes}>
            See Your Votes
          </Button>
        </Box>
        {isLoading ? (
          <div css={style.spinner}>
            <Spinner />
          </div>
        ) : (
          <>
            {hasChartData ? (
              <>
                <div css={style.chartContainer}>
                  <ReactFrappeChart
                    type="bar"
                    height={CHART_HEIGHT}
                    colors={chartConfig.colors}
                    axisOptions={chartConfig.axis}
                    barOptions={chartConfig.barOptions}
                    tooltipOptions={chartConfig.tooltipOptionsY}
                    data={chartData}
                  />
                </div>
                <div
                  css={[
                    Font.subtitle,
                    { margin: '-0.6em 0 0 1.1em' },
                    mode === 'amount' && { opacity: 0 },
                  ]}
                >
                  Note: APYs are estimates. They get more accurate over time.
                </div>
              </>
            ) : (
              <Box align="center" justify="center" margin="3em 1.5em">
                <p css={style.chartHelpText}>
                  Cast and activate validator group votes to start earning rewards!
                </p>
              </Box>
            )}
          </>
        )}
        <div css={style.tableContainer}>
          <HrDivider margin="1em 0 1.5em 0" />
          <Box align="center" justify="between" margin="0 0 1.8em 0">
            <h2 css={style.h2}>Staking History</h2>
            <SelectInput
              name="proposalId"
              autoComplete={false}
              width="15em"
              height={30}
              onChange={onChangeSelect}
              value={validator}
              options={selectOptions}
            />
          </Box>
          <Table<StakeEventTableRow>
            columns={tableColumns}
            data={tableData}
            initialSortBy="timestamp"
            isLoading={isLoading}
            hideDividerLine={true}
          />
        </div>
      </div>
    </ScreenContentFrame>
  )
}

const chartConfig = {
  colors: [Color.primaryGold],
  axis: { xAxisMode: 'tick', xIsSeries: true },
  barOptions: {
    stacked: false,
    spaceRatio: 0.5,
  },
  tooltipOptionsY: { formatTooltipY: (d: number | null) => `${d?.toFixed(3)}` },
}

const tableColumns: TableColumn[] = [
  {
    header: 'Group',
    id: 'name',
    renderer: (event) => event.group,
  },
  {
    header: 'Action',
    id: 'action',
    renderer: (event) => `${toTitleCase(event.action)}`,
  },
  {
    header: 'Amount',
    id: 'amount',
    renderer: (event) => event.amount.toFixed(2),
  },
  {
    header: 'Date',
    id: 'timestamp',
    renderer: (event) => new Date(event.timestamp).toLocaleDateString(),
  },
]

function getSelectOptions(stakeEvents: StakeEvent[], groups: ValidatorGroup[]) {
  const stakedGroups = new Set<string>()
  const options = [
    {
      display: 'All Groups',
      value: ALL_VALIDATORS,
    },
  ]
  for (const event of stakeEvents) {
    const groupAddr = event.group
    if (stakedGroups.has(groupAddr)) continue
    const groupName = findValidatorGroupName(groups, groupAddr, 'address')
    options.push({
      display: groupName,
      value: groupAddr,
    })
    stakedGroups.add(groupAddr)
  }
  return options
}

function stakeEventsToTableData(
  stakeEvents: StakeEvent[],
  groups: ValidatorGroup[],
  selectedValidator: string
): StakeEventTableRow[] {
  const tableRows: StakeEventTableRow[] = []
  for (const event of stakeEvents) {
    const { txHash, group: groupAddr, type, value, timestamp } = event
    if (selectedValidator !== ALL_VALIDATORS && selectedValidator !== groupAddr) continue
    const groupName = findValidatorGroupName(groups, groupAddr, 'address')
    const row = {
      id: txHash,
      group: groupName,
      action: type,
      amount: fromWei(value),
      timestamp,
    }
    tableRows.push(row)
  }
  return tableRows
}

function computeChartData(
  stakeEvents: StakeEvent[],
  groupVotes: GroupVotes,
  groups: ValidatorGroup[],
  mode: 'amount' | 'apy'
) {
  const rewards = computeStakingRewards(stakeEvents, groupVotes, mode)
  const chartData: any = {
    labels: [],
    datasets: [
      {
        name: mode === 'apy' ? 'APY' : 'Amount',
        chartType: 'bar',
        values: [],
      },
    ],
  }
  for (const group of Object.keys(rewards)) {
    const groupName = findValidatorGroupName(groups, group, 'address')
    chartData.labels.push(groupName)
    const reward = rewards[group]
    chartData.datasets[0].values.push(reward)
  }
  return chartData
}

function HelpButton() {
  return (
    <HelpIcon
      width="1em"
      modal={{ head: 'About Staking Rewards', content: <HelpModal /> }}
      margin="0 0 0 0.4em"
    />
  )
}

function HelpModal() {
  return (
    <BasicHelpIconModal>
      <p>
        If you have activated votes for a validator group and it has at least one elected validator,
        then you will earn rewards.
      </p>
      <p>
        Rewards are distributed automatically. This screen shows stats about what you have earned so
        far.
      </p>
    </BasicHelpIconModal>
  )
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '42em',
  },
  h2: {
    fontSize: '1.1em',
    fontWeight: 500,
    color: Color.primaryBlack,
    opacity: 0.9,
    margin: 0,
    paddingTop: 4,
  },
  voteButton: {
    height: '2.1em',
    fontWeight: 400,
  },
  chartContainer: {
    marginLeft: '-1.4em',
    '*': {
      transition: 'initial',
    },
  },
  tableContainer: {
    marginRight: '1.5em',
  },
  chartHelpText: {
    ...Font.label,
    ...Font.center,
    letterSpacing: 'initial',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: CHART_HEIGHT + 3,
    opacity: 0.8,
  },
}
