import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { computeToCeloRate } from 'src/features/exchange/utils'
import {
  TransactionFeeProperty,
  TransactionStatusProperty,
} from 'src/features/feed/components/CommonTransactionProperties'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { txReviewStyles } from 'src/features/feed/components/txReviewStyles'
import { TokenExchangeTx } from 'src/features/types'
import { useTokens } from 'src/features/wallet/hooks'
import { Stylesheet } from 'src/styles/types'
import { CELO, getTokenById } from 'src/tokens'

interface Props {
  tx: TokenExchangeTx
}

export function TokenExchangeReview({ tx }: Props) {
  const tokens = useTokens()
  const rate = computeToCeloRate(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Amount">
        <Box styles={txReviewStyles.value}>
          <span css={style.amountLabel}>In: </span>
          <MoneyValue amountInWei={tx.fromValue} token={getTokenById(tx.fromTokenId, tokens)} />
        </Box>
        <Box styles={txReviewStyles.value}>
          <span css={style.amountLabel}>Out: </span>
          <MoneyValue amountInWei={tx.toValue} token={getTokenById(tx.toTokenId, tokens)} />
        </Box>
      </TransactionProperty>
      <TransactionFeeProperty tx={tx} />
      <TransactionProperty label="Rate">
        <Box styles={txReviewStyles.value}>
          <MoneyValue amountInWei={rate.weiBasis} token={CELO} />
          <span css={style.rateDivider}> : </span>
          <MoneyValue amountInWei={rate.weiRate} token={getTokenById(rate.otherTokenId, tokens)} />
        </Box>
      </TransactionProperty>
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  amountLabel: {
    display: 'inline-block',
    minWidth: '3em',
  },
  rateDivider: {
    padding: '0 0.5em',
  },
}
