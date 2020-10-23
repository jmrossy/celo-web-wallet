import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'

export function TransactionFeed() {
  const { transactions } = useSelector((s: RootState) => ({
    transactions: s.feed.transactions,
  }))

  return (
    <div css={{ marginTop: 20, flex: 1 }}>
      <ol>
        {Object.keys(transactions).map((hash) => (
          <li key={hash}>
            <p>{JSON.stringify(transactions[hash])}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
