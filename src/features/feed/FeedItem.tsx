import { ReactNode } from 'react'
import { ExchangeIcon } from 'src/components/icons/Exchange'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency, getCurrencyProps } from 'src/currency'
import { CeloTransaction, TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface FeedItemProps {
  tx: CeloTransaction
  isOpen: boolean
  onClick: (hash: string) => void
  collapsed?: boolean
}

interface FeedItemContent {
  icon: ReactNode
  description: string
  subDescription: string
  value: string
  currency: Currency
  isPositive?: boolean
}

export function FeedItem(props: FeedItemProps) {
  const { tx, isOpen, onClick, collapsed } = props

  const handleClick = () => {
    onClick(tx.hash)
  }

  const { icon, description, subDescription, value, currency, isPositive } = getContentByTxType(tx)
  const { symbol, color } = getCurrencyProps(currency)
  const sign = isPositive === true ? '+' : isPositive === false ? '-' : undefined

  return (
    <li key={tx.hash} css={[style.li, isOpen && style.liOpen]} onClick={handleClick}>
      {!collapsed ? (
        <Box direction="row" align="center" justify="between">
          <Box direction="row" align="center" justify="start">
            {icon}
            <div>
              <div css={style.descriptionText}>{description}</div>
              <div css={style.subDescriptionText}>{subDescription}</div>
            </div>
          </Box>
          <div css={style.moneyContainer}>
            <MoneyValue amountInWei={value} currency={currency} hideSymbol={true} sign={sign} />
            <div css={[style.currency, { color }]}>{symbol}</div>
          </div>
        </Box>
      ) : (
        <Box direction="row" align="center" justify="center">
          {icon}
        </Box>
      )}
    </li>
  )
}

function getContentByTxType(tx: CeloTransaction): FeedItemContent {
  const defaultContent = {
    icon: <Identicon address={tx.to} />,
    description: `Transaction ${tx.hash.substr(0, 8)}`,
    subDescription: getFormattedTimestamp(tx.timestamp),
    currency: Currency.CELO,
    value: tx.value,
  }

  if (
    tx.type === TransactionType.StableTokenTransfer ||
    tx.type === TransactionType.CeloNativeTransfer ||
    tx.type === TransactionType.CeloTokenTransfer
  ) {
    // TODO support comment encryption
    return {
      ...defaultContent,
      icon: <Identicon address={tx.isOutgoing ? tx.to : tx.from} />,
      description: tx.comment || (tx.isOutgoing ? 'Payment Sent' : 'Payment Received'),
      currency: tx.currency,
      isPositive: !tx.isOutgoing,
    }
  }

  if (
    tx.type === TransactionType.StableTokenApprove ||
    tx.type === TransactionType.CeloTokenApprove
  ) {
    return {
      ...defaultContent,
      description: 'Transfer Approval',
      currency: tx.currency,
      value: '0',
    }
  }

  if (tx.type === TransactionType.TokenExchange) {
    let description: string
    let currency: Currency
    if (tx.fromToken === Currency.CELO) {
      description = 'CELO to cUSD Exchange'
      currency = Currency.cUSD
    } else {
      description = 'cUSD to CELO Exchange'
      currency = Currency.CELO
    }
    return {
      ...defaultContent,
      icon: <ExchangeIcon toToken={tx.toToken} />,
      description,
      currency,
      value: tx.toValue,
      isPositive: true,
    }
  }

  if (tx.type === TransactionType.EscrowTransfer || tx.type === TransactionType.EscrowWithdraw) {
    return {
      ...defaultContent,
      description: tx.isOutgoing ? 'Escrow Payment' : 'Escrow Withdrawal',
      currency: tx.currency,
      isPositive: !tx.isOutgoing,
    }
  }

  if (tx.type === TransactionType.LockCelo || tx.type === TransactionType.RelockCelo) {
    return {
      ...defaultContent,
      description: 'Lock CELO',
      isPositive: false,
    }
  }
  if (tx.type === TransactionType.UnlockCelo) {
    return {
      ...defaultContent,
      description: 'Unlock CELO',
    }
  }
  if (tx.type === TransactionType.WithdrawLockedCelo) {
    return {
      ...defaultContent,
      description: 'Withdraw CELO',
      isPositive: true,
    }
  }

  if (tx.type === TransactionType.ValidatorVoteCelo) {
    return {
      ...defaultContent,
      description: 'Vote for Validator',
    }
  }
  if (tx.type === TransactionType.ValidatorActivateCelo) {
    return {
      ...defaultContent,
      description: 'Activate Validator Vote',
    }
  }
  if (
    tx.type === TransactionType.ValidatorRevokeActiveCelo ||
    tx.type === TransactionType.ValidatorRevokePendingCelo
  ) {
    return {
      ...defaultContent,
      description: 'Revoke Validator Vote',
    }
  }

  if (tx.type === TransactionType.GovernanceVote) {
    return {
      ...defaultContent,
      description: 'Governance Vote',
    }
  }

  return defaultContent
}

function getFormattedTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString()
}

const style: Stylesheet = {
  li: {
    listStyle: 'none',
    padding: '1em 0.8em',
    borderBottom: `1px solid ${Color.borderLight}`,
    cursor: 'pointer',
    ':hover': {
      background: Color.fillLight,
    },
  },
  liOpen: {
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
  moneyContainer: {
    textAlign: 'right',
  },
  currency: {
    ...Font.subtitle,
    marginTop: '0.4em',
  },
}
