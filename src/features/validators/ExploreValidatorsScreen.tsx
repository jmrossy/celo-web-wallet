import { useMemo } from 'react'
import { TextLink } from 'src/components/buttons/TextLink'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table } from 'src/components/Table'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function ExploreValidatorsScreen() {
  // const dispatch = useDispatch()
  // const navigate = useNavigate()

  const data = useMemo(
    () => [
      {
        name: 'Anchorage',
        elected: '5/5',
        votes: '15,965,203',
        percent: '5.77%',
        status: 'Good',
      },
      {
        name: 'Polychain Labs',
        elected: '3/4',
        votes: '6,382,029',
        percent: '3.87%',
        status: 'Good',
      },
      {
        name: 'Unnamed Group',
        elected: '2/2',
        votes: '3,293,103',
        percent: '2.50%',
        status: 'Poor',
      },
    ],
    []
  )

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
        <Table columns={columns} data={data} />
      </div>
    </ScreenContentFrame>
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
}
