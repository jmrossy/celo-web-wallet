import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { HrDivider } from 'src/components/HrDivider'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table, TableColumn } from 'src/components/Table'
import {
  fetchValidatorsActions,
  fetchValidatorsSagaName,
} from 'src/features/validators/fetchValidators'
import { validatorGroupsToTableData } from 'src/features/validators/tableUtils'
import { ValidatorGroupTableRow } from 'src/features/validators/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { formatNumberWithCommas } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'
import { toTitleCase } from 'src/utils/string'
import { useSagaStatus } from 'src/utils/useSagaStatus'

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

  const status = useSagaStatus(
    fetchValidatorsSagaName,
    'Error Fetching Validator Info',
    'Something went wrong when finding validators, sorry! Please try again later.'
  )

  const groups = useSelector((state: RootState) => state.validators.validatorGroups.groups)

  const data = useMemo(() => {
    return validatorGroupsToTableData(groups)
  }, [groups])

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={style.h1}>
          Track Staking Rewards <HelpButton />
        </h1>
        <Box direction="row" align="end" justify="between" margin="1.5em 0">
          <ButtonToggle label1="APY" label2="Amount" onToggle={onToggleMode} />
          <Button size="s" styles={style.voteButton} onClick={onClickSeeVotes}>
            See Your Votes
          </Button>
        </Box>
        {mode && <div>Chart HERE!</div>}
        <HrDivider margin="2em 0" />
        <Table<ValidatorGroupTableRow>
          columns={tableColumns}
          data={data}
          initialSortBy="date"
          isLoading={status === SagaStatus.Started}
          hideDividerLine={true}
        />
      </div>
    </ScreenContentFrame>
  )
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
    maxWidth: '40em',
  },
  h1: {
    ...Font.h2Green,
    marginBottom: '0.3em',
  },
  h3: {
    ...Font.body,
    margin: 0,
    paddingBottom: '0.2em',
  },
  voteButton: {
    height: '2.1em',
    fontWeight: 400,
  },
}
