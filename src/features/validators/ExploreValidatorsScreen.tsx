import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { RefreshButton } from 'src/components/buttons/RefreshButton'
import { TextLink } from 'src/components/buttons/TextLink'
import { CircleIcon } from 'src/components/icons/Circle'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table, TableColumn } from 'src/components/table/Table'
import {
  fetchValidatorsActions,
  fetchValidatorsSagaName,
} from 'src/features/validators/fetchValidators'
import { validatorGroupsToTableData } from 'src/features/validators/tableUtils'
import {
  ValidatorGroupStatus,
  ValidatorGroupTableRow,
  ValidatorStatus,
} from 'src/features/validators/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { formatNumberWithCommas } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatus } from 'src/utils/useSagaStatus'

export function ExploreValidatorsScreen() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchValidatorsActions.trigger({}))
  }, [])

  const onClickRefresh = () => {
    dispatch(fetchValidatorsActions.trigger({ force: true }))
  }

  const onClickVote = () => {
    navigate('/stake')
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
          Explore Validators{' '}
          <RefreshButton
            width="15px"
            height="15px"
            onClick={onClickRefresh}
            styles={style.refreshIcon}
          />
        </h1>
        <Box
          direction="row"
          align="end"
          justify="between"
          margin="2px 0 2em 0"
          styles={style.h3Row}
        >
          <h3 css={style.h3}>
            For more details, see{' '}
            <TextLink link="https://celo.org/validators/explore">celo.org</TextLink> or{' '}
            <TextLink link="https://thecelo.com/">thecelo.com</TextLink>
          </h3>
          <Button size="m" styles={style.voteButton} onClick={onClickVote}>
            See / Change Your Votes
          </Button>
        </Box>
        <Table<ValidatorGroupTableRow>
          columns={tableColumns}
          data={data}
          ExpandedRow={ExpandedRow}
          initialSortBy="votes"
          isLoading={status === SagaStatus.Started}
        />
      </div>
    </ScreenContentFrame>
  )
}

const tableColumns: TableColumn[] = [
  {
    header: 'Group Name',
    id: 'name',
    renderer: (group) => group.name.trim().substring(0, 30),
  },
  {
    header: 'Elected/Total',
    id: 'numMembers',
    renderer: (group) => `${group.numElected}/${group.numMembers}`,
  },
  {
    header: 'Current Votes',
    id: 'votes',
    renderer: (group) => formatNumberWithCommas(Math.round(group.votes)),
  },
  {
    header: '% of Total Votes',
    id: 'percent',
    renderer: (group) => `${group.percent.toFixed(2)}%`,
  },
  {
    header: 'Overall Status',
    id: 'status',
    renderer: renderStatus,
  },
]

function renderStatus(group: ValidatorGroupTableRow) {
  const status = group.status
  if (status === ValidatorGroupStatus.Poor) {
    return (
      <div>
        Poor
        <CircleIcon color={Color.primaryRed} size="0.6em" margin="0 0.4em 0 1.2em" />
      </div>
    )
  }
  if (status === ValidatorGroupStatus.Full) {
    return (
      <div>
        Full
        <CircleIcon color={Color.textWarning} size="0.6em" margin="0 0.4em 0 1.2em" />
      </div>
    )
  }
  if (status === ValidatorGroupStatus.Okay) {
    return (
      <div>
        Okay
        <CircleIcon color={Color.textWarning} size="0.6em" margin="0 0.4em 0 1.2em" />
      </div>
    )
  }
  if (status === ValidatorGroupStatus.Good) {
    return (
      <div>
        Good
        <CircleIcon color={Color.primaryGreen} size="0.6em" margin="0 0.4em 0 1.2em" />
      </div>
    )
  } else {
    throw new Error(`Invalid group status: ${status}`)
  }
}

function ExpandedRow({ row: group }: { row: ValidatorGroupTableRow }) {
  const navigate = useNavigate()

  const { address, members } = group
  const sortedMembers = Object.values(members).sort((a, b) => b.status - a.status)

  const onClickVote = (groupAddress: string) => {
    navigate('/stake', { state: { groupAddress } })
  }

  return (
    <div css={style.expandedGroupContainer}>
      <Box direction="row" align="center" justify="between" margin="0 0 0.75em 0">
        <CopiableAddress address={address} length="full" />
        <Button size="xs" margin="0 0 0 1.5em" onClick={() => onClickVote(address)}>
          Vote for Group
        </Button>
      </Box>
      <div css={style.groupMembersContainer}>
        <table css={style.groupMembersTable}>
          <tbody>
            {sortedMembers.map((v, i) => (
              <tr key={`expanded-group-validator-${v.address}`}>
                <td>{i + 1}</td>
                <td>{v.name ? v.name.trim().substring(0, 30) : 'Unnamed Validator'}</td>
                <td>
                  <CopiableAddress address={v.address} length="short" />
                </td>
                <td>
                  <CircleIcon
                    color={
                      v.status === ValidatorStatus.Elected ? Color.primaryGreen : Color.textWarning
                    }
                    size="0.6em"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const style: Stylesheet = {
  content: {
    width: '100%',
  },
  h1: {
    ...Font.h2Green,
    marginBottom: '0.3em',
  },
  h3Row: {
    maxWidth: '80em', // should match table
  },
  h3: {
    ...Font.body,
    margin: 0,
    paddingBottom: '0.2em',
  },
  voteButton: {
    width: '12em',
    height: '2.5em',
  },
  refreshIcon: {
    position: 'relative',
    top: 1,
    marginLeft: '0.5em',
  },
  expandedGroupContainer: {
    padding: '0 0 1.5em 1.2em',
    marginTop: '-0.8em',
    maxWidth: '30em',
  },
  groupMembersContainer: {
    borderLeft: '1px solid #D8DADB',
    paddingLeft: '1.5em',
  },
  groupMembersTable: {
    width: '100%',
    td: {
      paddingBottom: '0.3em',
      ':first-of-type': {
        textAlign: 'left',
        paddingRight: '1.2em',
      },
      ':last-of-type': {
        textAlign: 'right',
      },
    },
  },
}
