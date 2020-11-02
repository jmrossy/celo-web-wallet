import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { TransactionPropertyGroup } from 'src/components/layout/TransactionPropertyGroup'
import { config } from 'src/config'
import { openTransaction } from 'src/features/feed/feedSlice'
import { CeloTransaction, TransactionType } from 'src/features/feed/types'
import { TokenTransferReview } from 'src/features/home/TokenTransferReview'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { chunk } from 'src/utils/string'

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
      <TransactionAdvancedDetails tx={tx} />
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

function TransactionAdvancedDetails({ tx }: { tx: CeloTransaction }) {
  // TODO make this collapsible
  const hashChunks = chunk(tx.hash, 4)

  return (
    <div css={style.contentContainer}>
      <div css={style.sectionHeader}>Advanced Details</div>
      <TransactionPropertyGroup>
        <div>
          <div css={Font.label}>Hash</div>
          <div css={style.value}>
            {hashChunks.slice(0, 6).map((c) => (
              <span key={`tx-hash-chunk-${c}`}>{c}</span>
            ))}
          </div>
          <div css={style.value}>
            {hashChunks.slice(6, 12).map((c) => (
              <span key={`tx-hash-chunk-${c}`}>{c}</span>
            ))}
          </div>
          <div css={style.value}>
            {hashChunks.slice(12).map((c) => (
              <span key={`tx-hash-chunk-${c}`}>{c}</span>
            ))}
          </div>
        </div>
        <div>
          <div css={Font.label}>Block Number</div>
          <div css={style.value}>{tx.blockNumber}</div>
        </div>
        <div>
          <div css={Font.label}>Nonce</div>
          <div css={style.value}>{tx.nonce}</div>
        </div>
        <div>
          <div css={Font.label}>Explore</div>
          <div css={style.value}>
            {' '}
            <a
              href={config.blockscoutUrl + `/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Blockscout
            </a>
          </div>
        </div>
      </TransactionPropertyGroup>
    </div>
  )
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
