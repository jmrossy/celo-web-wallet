import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import ReactFrappeChart from 'react-frappe-charts'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { HrDivider } from 'src/components/HrDivider'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table, TableColumn } from 'src/components/Table'
import {
  fetchValidatorsActions,
  fetchValidatorsSagaName,
} from 'src/features/validators/fetchValidators'
import { validatorGroupsToTableData } from 'src/features/validators/tableUtils'
import { ValidatorGroup, ValidatorGroupTableRow } from 'src/features/validators/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { formatNumberWithCommas } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'
import { toTitleCase } from 'src/utils/string'
import { useSagaStatus } from 'src/utils/useSagaStatus'

const ALL_VALIDATORS = 'all'

export function StakeRewardsScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    // TODO
    dispatch(fetchValidatorsActions.trigger({}))
  }, [])

  const onClickSeeVotes = () => {
    navigate('/stake')
  }

  const [mode, setMode] = useState<'apy' | 'amount'>('apy')
  const onToggleMode = (index: number) => {
    setMode(index === 0 ? 'apy' : 'amount')
  }

  const chartData = {
    labels: ['Anchorage', 'BitCandy', 'Tango', 'Foobar', 'Ayxsdfswewre', 'sdf', 'asdfs', '23fsd'],

    datasets: [
      {
        name: 'APY',
        chartType: 'bar',
        values: [4.5, 4.5, 4, 0.1, 4.6, 4, 3, 2],
      },
    ],
  }

  const groups = useSelector((state: RootState) => state.validators.validatorGroups.groups)
  const [validator, setValidator] = useState<string>(ALL_VALIDATORS)
  const onChangeSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setValidator(value)
  }
  const selectOptions = useMemo(() => getSelectOptions(groups), [groups])

  const tableData = useMemo(() => {
    return validatorGroupsToTableData(groups)
  }, [groups])

  const status = useSagaStatus(
    fetchValidatorsSagaName,
    'Error Fetching Validator Info',
    'Something went wrong when finding validators, sorry! Please try again later.'
  )

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>
          Track Staking Rewards <HelpButton />
        </h1>
        <Box direction="row" align="end" justify="between" margin="1.8em 1.5em 0 0">
          <ButtonToggle label1="APY" label2="Amount" onToggle={onToggleMode} />
          <Button size="s" styles={style.voteButton} onClick={onClickSeeVotes}>
            See Your Votes
          </Button>
        </Box>
        {mode && (
          <div css={style.chartContainer}>
            <ReactFrappeChart
              type="bar"
              height={200}
              colors={chartConfig.colors}
              axisOptions={chartConfig.axis}
              barOptions={chartConfig.barOptions}
              tooltipOptions={chartConfig.tooltipOptions}
              data={chartData}
            />
          </div>
        )}
        <div css={style.tableContainer}>
          <HrDivider margin="1em 0 1.5em 0" />
          <Box align="center" justify="between" margin="0 0 2em 0">
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
          <Table<ValidatorGroupTableRow>
            columns={tableColumns}
            data={tableData}
            initialSortBy="date"
            isLoading={status === SagaStatus.Started}
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
  tooltipOptions: { formatTooltipY: (d: number | null) => d + '%' },
}

const tableColumns: TableColumn[] = [
  {
    header: 'Group',
    id: 'name',
    renderer: (group) => group.name.trim().substring(0, 20),
  },
  {
    header: 'Action',
    id: 'action',
    renderer: (group) => `${toTitleCase(group.action || 'Hi')}`,
  },
  {
    header: 'Amount',
    id: 'amount',
    renderer: (group) => formatNumberWithCommas(Math.round(group.votes)),
  },
  {
    header: 'Date',
    id: 'date',
    renderer: (group) => `${group.percent.toFixed(2)}%`,
  },
]

function getSelectOptions(validatorGroups: ValidatorGroup[]) {
  return validatorGroups
    .filter((g) => g?.name)
    .map((g) => {
      return {
        display: g.name.trim().substring(0, 20) || 'Unnamed Group',
        value: g.address,
      }
    })
    .concat({
      display: 'All Groups',
      value: ALL_VALIDATORS,
    })
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
    marginLeft: '-2.2em',
    '*': {
      transition: 'initial',
    },
  },
  tableContainer: {
    marginRight: '1.5em',
  },
}
