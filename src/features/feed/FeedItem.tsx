import { CSSProperties, ReactNode } from 'react'
import { ExchangeIcon } from 'src/components/icons/Exchange'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { getTransactionDescription } from 'src/features/feed/transactionDescription'
import { CeloTransaction, TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { CELO, getTokenById, Token, Tokens } from 'src/tokens'

export const FEED_ITEM_HEIGHT_NORMAL = 70
export const FEED_ITEM_HEIGHT_COMPACT = 65

interface FeedItemProps {
  index: number
  style: CSSProperties // comes from react-window
  data: FeedItemData[]
}

export interface FeedItemData {
  tx: CeloTransaction
  tokens: Tokens
  isOpen: boolean
  onClick: (hash: string) => void
  itemSize: number
  collapsed?: boolean
}

interface FeedItemContent {
  icon: ReactNode
  description: string
  subDescription: string
  value: string
  token: Token
  isPositive?: boolean
}

export function FeedItem(props: FeedItemProps) {
  const { index, style: containerStyle, data } = props
  const { tx, tokens, isOpen, onClick, itemSize, collapsed } = data[index]

  const handleClick = () => {
    onClick(tx.hash)
  }

  const { icon, description, subDescription, value, token, isPositive } = getContentByTxType(
    tx,
    tokens
  )
  const { symbol, color } = token
  const sign = isPositive === true ? '+' : isPositive === false ? '-' : undefined

  return (
    <div style={containerStyle}>
      <div
        css={[
          style.item,
          { height: itemSize - 2 },
          isOpen && style.itemOpen,
          collapsed && { justifyContent: 'center' },
        ]}
        onClick={handleClick}
      >
        {!collapsed ? (
          <>
            <Box direction="row" align="center" justify="start">
              {icon}
              <div>
                <div css={style.descriptionText}>{description}</div>
                <div css={style.subDescriptionText}>{subDescription}</div>
              </div>
            </Box>
            <Box direction="column" align="end">
              <MoneyValue amountInWei={value} token={token} symbolType="none" sign={sign} />
              <div css={[style.currency, { color }]}>{symbol}</div>
            </Box>
          </>
        ) : (
          <div>{icon}</div>
        )}
      </div>
    </div>
  )
}

function getContentByTxType(tx: CeloTransaction, tokens: Tokens): FeedItemContent {
  const defaultContent = {
    icon: <Identicon address={tx.to} />,
    description: getTransactionDescription(tx, tokens),
    subDescription: getFormattedTimestamp(tx.timestamp),
    token: CELO,
    value: tx.value,
  }

  if (
    tx.type === TransactionType.StableTokenTransfer ||
    tx.type === TransactionType.CeloNativeTransfer ||
    tx.type === TransactionType.CeloTokenTransfer ||
    tx.type === TransactionType.OtherTokenTransfer
  ) {
    // TODO support comment encryption
    return {
      ...defaultContent,
      icon: <Identicon address={tx.isOutgoing ? tx.to : tx.from} />,
      token: getTokenById(tx.tokenId, tokens),
      isPositive: !tx.isOutgoing,
    }
  }

  if (
    tx.type === TransactionType.StableTokenApprove ||
    tx.type === TransactionType.CeloTokenApprove
  ) {
    return {
      ...defaultContent,
      token: getTokenById(tx.tokenId, tokens),
      value: '0',
    }
  }

  if (tx.type === TransactionType.TokenExchange) {
    const toToken = getTokenById(tx.toTokenId, tokens)
    return {
      ...defaultContent,
      icon: <ExchangeIcon toToken={toToken} />,
      token: toToken,
      value: tx.toValue,
      isPositive: true,
    }
  }

  if (tx.type === TransactionType.EscrowTransfer || tx.type === TransactionType.EscrowWithdraw) {
    return {
      ...defaultContent,
      token: getTokenById(tx.tokenId, tokens),
      isPositive: !tx.isOutgoing,
    }
  }

  if (tx.type === TransactionType.LockCelo || tx.type === TransactionType.RelockCelo) {
    return {
      ...defaultContent,
      isPositive: false,
    }
  }
  if (tx.type === TransactionType.WithdrawLockedCelo) {
    return {
      ...defaultContent,
      isPositive: true,
    }
  }

  return defaultContent
}

function getFormattedTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString()
}

const style: Stylesheet = {
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1px 0.8em 0 0.8em',
    borderBottom: `1px solid ${Color.borderLight}`,
    cursor: 'pointer',
    ':hover': {
      background: Color.fillLight,
    },
    ':active': {
      background: Color.fillMedium,
    },
  },
  itemOpen: {
    background: Color.fillLight,
    borderBottomColor: Color.fillLight,
  },
  descriptionText: {
    marginLeft: '1em',
  },
  subDescriptionText: {
    ...Font.subtitle,
    marginTop: '0.4em',
    marginLeft: '1em',
  },
  currency: {
    ...Font.subtitle,
    marginTop: '0.4em',
  },
}
