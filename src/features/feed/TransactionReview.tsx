import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { GenericTransactionReview } from 'src/features/feed/components/GenericTransactionReview'
import { TokenExchangeReview } from 'src/features/feed/components/TokenExchangeReview'
import { TokenTransferReview } from 'src/features/feed/components/TokenTransferReview'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { openTransaction } from 'src/features/feed/feedSlice'
import { CeloTransaction, TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function TransactionReview() {
  const navigate = useNavigate()
  const { transactions, openTransaction: openTx } = useSelector((s: RootState) => s.feed)

  // Make sure this is the correct screen
  useEffect(() => {
    if (!openTx) {
      navigate('/')
    }
  }, [openTx])

  const dispatch = useDispatch()

  const onCloseClick = () => {
    dispatch(openTransaction(null))
    navigate('/')
  }

  if (!openTx) {
    return <TransactionNotFound />
  }

  const tx = transactions[openTx]
  if (!tx) {
    return <TransactionNotFound />
  }

  const { header, content } = getContentByTxType(tx)

  return (
    <div css={style.container}>
      <Box align="center" justify="between" styles={style.header}>
        <span>{header}</span>
        {/* TODO a real x icon */}
        <a onClick={onCloseClick} css={style.closeButton}>
          X
        </a>
      </Box>
      <div css={style.contentContainer}>
        <div css={style.sectionHeader}>Transaction Details</div>
        {content}
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
    return {
      header: tx.isOutgoing ? 'Payment Sent' : 'Payment Received',
      content: <TokenTransferReview tx={tx} />,
    }
  }

  if (tx.type === TransactionType.TokenExchange) {
    return {
      header: 'Tokens Exchanged',
      content: <TokenExchangeReview tx={tx} />,
    }
  }

  return {
    header: 'Transaction Sent',
    content: <GenericTransactionReview tx={tx} />,
  }
}

// TODO
function TransactionNotFound() {
  return <div>Transaction Not Found!</div>
}

function TransactionAdvancedDetails({ tx }: { tx: CeloTransaction }) {
  // TODO make this collapsible
  const hash = tx.hash

  return (
    <div css={style.contentContainer}>
      <div css={style.sectionHeader}>Advanced Details</div>
      <TransactionPropertyGroup>
        <TransactionProperty label="Transaction Hash">
          <div css={style.value}>{hash.substring(0, hash.length / 2)}</div>
          <div css={style.value}>{hash.substring(hash.length / 2)}</div>
        </TransactionProperty>
        <TransactionProperty label="Explore">
          <div css={style.value}>
            {' '}
            <a
              href={config.blockscoutUrl + `/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              css={Font.linkLight}
            >
              View on Blockscout
            </a>
          </div>
        </TransactionProperty>
        <TransactionProperty label="Block Number">
          <div css={style.value}>{tx.blockNumber}</div>
        </TransactionProperty>
        <TransactionProperty label="Nonce">
          <div css={style.value}>{tx.nonce}</div>
        </TransactionProperty>
      </TransactionPropertyGroup>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    overflow: 'auto',
  },
  header: {
    ...Font.h2,
    background: Color.accentBlue,
    color: Color.primaryWhite,
    padding: '0.8rem 2rem',
  },
  closeButton: {
    ...Font.h2,
    color: Color.primaryWhite,
    fontWeight: 600,
    cursor: 'pointer',
  },
  contentContainer: {
    padding: '2rem',
  },
  sectionHeader: {
    ...Font.h2,
    color: Color.textGrey,
    marginBottom: '1.5em',
  },
}
