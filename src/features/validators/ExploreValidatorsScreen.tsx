import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { RefreshButton } from 'src/components/buttons/RefreshButton'
import { TextLink } from 'src/components/buttons/TextLink'
import { CircleIcon } from 'src/components/icons/Circle'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { Table, TableColumn } from 'src/components/Table'
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

export function ExploreValidatorsScreen() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchValidatorsActions.trigger({}))
  }, [])

  const onClickRefresh = () => {
    dispatch(fetchValidatorsActions.trigger({ force: true }))
  }

  const status = useSagaStatus(
    fetchValidatorsSagaName,
    'Error Fetching Validator Info',
    'Something went wrong when finding validators, sorry! Please try again later.'
  )

  const groups = useSelector((state: RootState) => state.validators.groups)

  const data = useMemo(() => {
    return validatorGroupsToTableData(groups)
  }, [groups])

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>
          Explore Validators{' '}
          <RefreshButton
            width="15px"
            height="15px"
            onClick={onClickRefresh}
            styles={style.refreshIcon}
          />
        </h1>
        <h3 css={style.h3}>
          For more detailed lists, see{' '}
          <TextLink link="https://celo.org/validators/explore">celo.org</TextLink> or{' '}
          <TextLink link="https://thecelo.com/">thecelo.com</TextLink>
        </h3>
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

  const onClickVote = (groupAddr: string) => {
    navigate('/stake', { state: { groupAddr } })
  }

  return (
    <div css={style.expandedGroupContainer}>
      <Box direction="row" align="center" justify="between" margin="0 0 0.75em 0">
        <CopiableAddress address={address} length="full" />
        <Button size="s" styles={style.voteButton} onClick={() => onClickVote(address)}>
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
  h3: {
    ...Font.body,
    marginBottom: '1.5em',
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
  voteButton: {
    width: '7em',
    height: '1.75em',
    fontSize: '0.9em',
    marginLeft: '1.5em',
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
