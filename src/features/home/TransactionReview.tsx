import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { openTransaction } from 'src/features/feed/feedSlice'
import { CeloTransaction, TransactionType } from 'src/features/feed/types'
import { TokenTransferReview } from 'src/features/home/TokenTransferReview'
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
        <div css={style.sectionHeader}>Transaction Details</div>
        {getContentByTxType(tx)}
      </div>
    </div>
  )
}

function getContentByTxType(tx: CeloTransaction) {
  if (
    tx.type === TransactionType.StableTokenTransfer ||
    tx.type === TransactionType.CeloNativeTransfer ||
    tx.type === TransactionType.CeloTokenTransfer
  ) {
    return <TokenTransferReview tx={tx} />
  }

  if (tx.type === TransactionType.TokenExchange) {
    return <div>TODO</div>
  }

  return <div>default content TODO</div>
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
    padding: '1.5em',
  },
  sectionHeader: {
    ...Font.header,
    marginBottom: '2em',
  },
}
