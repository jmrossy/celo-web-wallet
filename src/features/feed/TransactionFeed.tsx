import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { FeedItem } from 'src/features/feed/FeedItem'
import { Stylesheet } from 'src/styles/types'

export function TransactionFeed() {
  const transactions = useSelector((s: RootState) => s.feed.transactions)
  const openTransaction = useSelector((s: RootState) => s.feed.openTransaction)

  return (
    <div css={style.container}>
      <ol css={style.ol}>
        {/* Use some kind of flatlist or pagination */}
        {Object.keys(transactions).map((hash) => (
          <FeedItem tx={transactions[hash]} key={hash} isOpen={openTransaction === hash} />
        ))}
      </ol>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    marginTop: '0.5em',
    flex: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  ol: {
    listStyle: 'none',
    margin: 0,
    padding: '0.5em',
  },
}
