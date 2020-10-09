import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { fetchFeedActions } from 'src/features/feed/fetch'

export function TransactionFeed() {
  const { transactions } = useSelector((s: RootState) => ({
    transactions: s.feed.transactions,
  }))

  const dispatch = useDispatch()

  const onClickFetchFeed = () => {
    dispatch(fetchFeedActions.trigger())
  }

  return (
    <div css={{ marginTop: 20 }}>
      <button onClick={onClickFetchFeed}>Fetch Transaction Feed</button>
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
