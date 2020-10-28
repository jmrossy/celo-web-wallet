import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { openTransaction } from 'src/features/feed/feedSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
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
      <Box align="center" justify="between" styles={style.header}>
        <span>Payment Received</span>
        {/* TODO a real x icon */}
        <a onClick={onCloseClick} css={style.closeButton}>
          X
        </a>
      </Box>
      <div css={style.contentContainer}>
        <div css={Font.header}>Transaction Details</div>
        <div css={style.txProperties}>
          <span css={Font.label}>Status</span>
          <span css={style.txPropertyValue}>Confirmed</span>
          <span css={Font.label}>Status</span>
          <span css={style.txPropertyValue}>Confirmed</span>
        </div>
      </div>
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
    ...Font.header,
    background: Color.accentBlue,
    color: Color.primaryWhite,
    padding: '0.9em 1.5em',
  },
  closeButton: {
    ...Font.header,
    color: Color.primaryWhite,
    fontWeight: 600,
    cursor: 'pointer',
  },
  contentContainer: {
    padding: '1em 1.5em',
  },
  txProperties: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRow: 'repeat(4, 1fr)',
    gap: '1em 1em',
  },
  txPropertyValue: {
    fontWeight: 400,
  },
}
