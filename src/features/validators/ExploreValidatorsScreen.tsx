import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { TextLink } from 'src/components/buttons/TextLink'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table } from 'src/components/Table'
import { fetchValidatorsActions } from 'src/features/validators/fetchValidators'
import { ValidatorGroupTableRow } from 'src/features/validators/types'
import { validatorGroupsToTableData } from 'src/features/validators/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ExploreValidatorsScreen() {
  const dispatch = useDispatch()
  // const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchValidatorsActions.trigger())
  }, [])

  const groups = useSelector((state: RootState) => state.validators.groups)

  const data = useMemo(() => {
    return validatorGroupsToTableData(groups)
  }, [groups])

  const columns = useMemo(
    () => [
      {
        header: 'Group Name',
        id: 'name',
      },
      {
        header: 'Elected/Total',
        id: 'elected',
      },
      {
        header: 'Current Votes',
        id: 'votes',
      },
      {
        header: '% of Total Votes',
        id: 'percent',
      },
      {
        header: 'Overall Status',
        id: 'status',
      },
    ],
    []
  )

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>Explore Validators</h1>
        <h3 css={style.h3}>
          For more detailed lists, see{' '}
          <TextLink link="https://celo.org/validators/explore">celo.org</TextLink> or{' '}
          <TextLink link="https://thecelo.com/">thecelo.com</TextLink>
        </h3>
        <Table<ValidatorGroupTableRow>
          columns={columns}
          data={data}
          renderExpanded={renderExpanded}
        />
      </div>
    </ScreenContentFrame>
  )
}

function renderExpanded(group: ValidatorGroupTableRow) {
  return <div>{group.name}</div>
}

const style: Stylesheet = {
  content: {
    width: '100%',
  },
  h3: {
    ...Font.body,
    marginBottom: '1.5em',
  },
}
