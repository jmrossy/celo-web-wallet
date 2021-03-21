import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import { computeToCeloRate } from 'src/features/exchange/utils'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { TokenExchangeTx } from 'src/features/types'
import { useTokens } from 'src/features/wallet/utils'
import { Stylesheet } from 'src/styles/types'
import { CELO, getTokenById } from 'src/tokens'

interface Props {
  tx: TokenExchangeTx
}

export function TokenExchangeReview({ tx }: Props) {
  const tokens = useTokens()
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)
  const rate = computeToCeloRate(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Amount">
        <Box styles={style.value}>
          <span css={style.amountLabel}>In: </span>
          <MoneyValue amountInWei={tx.fromValue} token={getTokenById(tx.fromTokenId, tokens)} />
        </Box>
        <Box styles={style.value}>
          <span css={style.amountLabel}>Out: </span>
          <MoneyValue amountInWei={tx.toValue} token={getTokenById(tx.fromTokenId, tokens)} />
        </Box>
      </TransactionProperty>
      <TransactionProperty label="Fee">
        <div css={style.value}>
          <MoneyValue amountInWei={feeValue} token={feeCurrency} />
        </div>
      </TransactionProperty>
      <TransactionProperty label="Rate">
        <Box styles={style.value}>
          <MoneyValue amountInWei={rate.weiBasis} token={CELO} />
          <span css={style.rateDivider}> : </span>
          <MoneyValue amountInWei={rate.weiRate} token={getTokenById(rate.otherTokenId, tokens)} />
        </Box>
      </TransactionProperty>
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  value: {
    marginTop: '0.75em',
  },
  amountLabel: {
    display: 'inline-block',
    minWidth: '3em',
  },
  rateDivider: {
    padding: '0 0.5em',
  },
}
