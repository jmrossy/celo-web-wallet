import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { FeedItem } from 'src/features/feed/FeedItem'
import { openTransaction } from 'src/features/feed/feedSlice'
import { TransactionMap } from 'src/features/feed/types'
import { Stylesheet } from 'src/styles/types'

export function TransactionFeed() {
  const openTransactionHash = useSelector((s: RootState) => s.feed.openTransaction)
  const transactions = useSelector((s: RootState) => s.feed.transactions)
  const sortedTransaction = getSortedTransactions(transactions)

  const dispatch = useDispatch()
  const onFeedItemClick = (hash: string) => {
    dispatch(openTransaction(hash))
  }

  return (
    <div css={style.container}>
      <ol css={style.ol}>
        {/* TODO: Use some kind of flatlist or pagination */}
        {sortedTransaction.map((tx) => (
          <FeedItem
            tx={tx}
            key={tx.hash}
            onClick={onFeedItemClick}
            isOpen={openTransactionHash === tx.hash}
          />
        ))}
      </ol>
    </div>
  )
}

function getSortedTransactions(transactions: TransactionMap) {
  return Object.values(transactions).sort((a, b) => b.timestamp - a.timestamp)
}

const style: Stylesheet = {
  container: {
    flex: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  ol: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
}
