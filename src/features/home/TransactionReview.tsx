import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { openTransaction } from 'src/features/feed/feedSlice'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

interface Props {
  txHash: string
}

export function TransactionReview(props: Props) {
  const { txHash } = props

  const dispatch = useDispatch()
  const onCloseClick = () => {
    dispatch(openTransaction(null))
  }

  const transactions = useSelector((s: RootState) => s.feed.transactions)
  const tx = transactions[txHash]
  if (!tx) {
    return <TransactionNotFound />
  }

  return (
    <div css={style.container}>
      <div css={style.header}>
        TODO tx header
        <button onClick={onCloseClick}>X</button>
      </div>
      <div>TODO tx review content</div>
    </div>
  )
}

// TODO
function TransactionNotFound() {
  return <div>Transaction Not Found!</div>
}

const style: Stylesheet = {
  container: {
    overflow: 'auto',
  },
  header: {
    background: Color.accentBlue,
  },
}
