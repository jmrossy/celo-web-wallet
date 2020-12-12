import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from 'src/app/rootReducer'
import { CloseButton } from 'src/components/CloseButton'
import Chevron from 'src/components/icons/chevron.svg'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { GenericTransactionReview } from 'src/features/feed/components/GenericTransactionReview'
import { TokenExchangeReview } from 'src/features/feed/components/TokenExchangeReview'
import { TokenTransferReview } from 'src/features/feed/components/TokenTransferReview'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { openTransaction, toggleAdvancedDetails } from 'src/features/feed/feedSlice'
import { CeloTransaction, TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

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
        <div>{header}</div>
        <CloseButton onClick={onCloseClick} styles={style.closeButton} />
      </Box>
      <div css={style.contentContainer}>
        <h2 css={style.sectionHeader}>Transaction Details</h2>
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

  if (tx.type === TransactionType.EscrowTransfer || tx.type === TransactionType.EscrowWithdraw) {
    return {
      header: tx.isOutgoing ? 'Payment Sent to Escrow' : 'Funds Withdrawn from Escrow',
      content: <TokenTransferReview tx={tx} />,
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
  const hash = tx.hash

  const showContent = useSelector((s: RootState) => s.feed.showAdvancedDetails)
  const dispatch = useDispatch()

  const onClickHeader = () => {
    dispatch(toggleAdvancedDetails())
  }

  const chevronStyle = showContent ? chevronRotated : style.chevron

  return (
    <div css={style.contentContainer}>
      <h2 css={sectionHeaderAdvanced} onClick={onClickHeader}>
        Advanced Details
        <img width={'18em'} src={Chevron} alt="chevron" css={chevronStyle} />
      </h2>
      <div css={showContent ? null : style.contentHidden}>
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
                View on Celo Explorer
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
    padding: '0.85rem 2rem',
  },
  closeButton: {
    position: 'relative',
    top: 2,
    img: {
      filter: 'brightness(0) invert(1)',
    },
    ':hover': {
      filter: 'brightness(0.9)',
    },
  },
  contentContainer: {
    padding: '1rem 2rem',
  },
  contentHidden: {
    maxHeight: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    ...Font.h2,
    color: Color.textGrey,
    marginBottom: '1.5em',
  },
  chevron: {
    opacity: 0.5,
    padding: '0 0.6em',
  },
}

const chevronRotated: Styles = {
  ...style.chevron,
  transform: 'rotate(180deg)',
}

const sectionHeaderAdvanced: Styles = {
  ...style.sectionHeader,
  width: 'fit-content',
  cursor: 'pointer',
}
