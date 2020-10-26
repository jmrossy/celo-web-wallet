import { ReactNode } from 'react'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { getCurrencyProps, MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { CeloTransaction, TransactionType } from 'src/features/feed/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface FeedItemProps {
  tx: CeloTransaction
  isOpen: boolean
  onClick: (hash: string) => void
}

interface FeedItemContent {
  icon: ReactNode
  description: string
  subDescription: string
  value: string
  currency: Currency
  isPositive: boolean
}

export function FeedItem(props: FeedItemProps) {
  const { tx, isOpen, onClick } = props

  const handleClick = () => {
    onClick(tx.hash)
  }

  const {
    icon,
    description,
    subDescription,
    value,
    currency,
    isPositive,
  } = getFeedContentForTxType(tx)

  const { symbol, color } = getCurrencyProps(currency)

  return (
    <li key={tx.hash} css={[style.li, isOpen && style.liOpen]} onClick={handleClick}>
      <Box direction="row" align="center" justify="between">
        <Box direction="row" align="center" justify="start">
          {icon}
          <div>
            <div css={style.descriptionText}>{description}</div>
            <div css={style.subDescriptionText}>{subDescription}</div>
          </div>
        </Box>
        <div css={style.moneyContainer}>
          <MoneyValue
            amountInWei={value}
            currency={currency}
            hideSymbol={true}
            sign={isPositive ? '-' : '+'}
          />
          <div css={[style.currency, { color }]}>{symbol}</div>
        </div>
      </Box>
    </li>
  )
}

function getFeedContentForTxType(tx: CeloTransaction): FeedItemContent {
  const subDescription = getFormattedTimestamp(tx.timestamp)

  if (
    tx.type === TransactionType.StableTokenTransfer ||
    tx.type === TransactionType.CeloNativeTransfer ||
    tx.type === TransactionType.CeloTokenTransfer
  ) {
    const currency = tx.type === TransactionType.StableTokenTransfer ? Currency.cUSD : Currency.CELO
    // TODO support comment encryption
    const description = tx.comment ?? (tx.isOutgoing ? 'Payment Sent' : 'Payment Received')
    const icon = <Identicon address={tx.isOutgoing ? tx.to : tx.from} />

    return {
      icon,
      description,
      subDescription,
      currency,
      value: tx.value,
      isPositive: !tx.isOutgoing,
    }
  }
  if (tx.type === TransactionType.TokenExchange) {
    // TODO create an exchange tx  icon
    const icon = <Identicon address={tx.to} />
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
      icon,
      description,
      subDescription,
      currency,
      value: tx.toValue,
      isPositive: true,
    }
  }

  // TODO create an 'other' tx  icon
  const icon = <Identicon address={tx.to} />
  const description = `Transaction ${tx.hash.substr(0, 8)}`

  return {
    icon,
    description,
    subDescription,
    currency: Currency.CELO,
    value: tx.value,
    isPositive: false,
  }
}

function getFormattedTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString()
}

const style: Stylesheet = {
  li: {
    listStyle: 'none',
    padding: '0.6em',
    borderBottom: `1px solid ${Color.borderLight}`,
    cursor: 'pointer',
    ':hover': {
      background: 'rgba(167, 190, 178, 0.08)',
    },
  },
  liOpen: {
    background: 'rgba(167, 190, 178, 0.08)',
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
