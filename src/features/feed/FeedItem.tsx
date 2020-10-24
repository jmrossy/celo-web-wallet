import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { CeloTransaction } from 'src/features/feed/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface FeedItemProps {
  tx: CeloTransaction
  isOpen: boolean
}

export function FeedItem(props: FeedItemProps) {
  const { tx } = props

  return (
    <li key={tx.hash} css={style.li}>
      <Box direction="row" align="center" justify="between">
        <Box direction="row" align="center" justify="start">
          <Identicon address={tx.from} />
          <div>
            <div css={style.descriptionText}>{tx.hash.substr(0, 8)}</div>
            <div css={style.subDescriptionText}>{tx.timestamp}</div>
          </div>
        </Box>
        <div>
          <MoneyValue
            amountInWei={tx.value}
            currency={Currency.CELO}
            hideSymbol={true}
            sign={'-'}
          />
          <div>cUSD</div>
        </div>
      </Box>
    </li>
  )
}

const style: Stylesheet = {
  li: {
    listStyle: 'none',
    padding: '0.2em 0',
  },
  descriptionText: {
    marginLeft: '1em',
  },
  subDescriptionText: {
    ...Font.subtitle,
    marginLeft: '1em',
  },
}
