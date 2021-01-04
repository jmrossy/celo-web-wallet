import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/currency'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { TokenExchangeTx } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'
import { computeRate } from 'src/utils/amount'

interface Props {
  tx: TokenExchangeTx
}

export function TokenExchangeReview({ tx }: Props) {
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)
  const rate = computeRate(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Amount">
        <div css={style.value}>
          <span css={style.amountLabel}>In: </span>
          <MoneyValue amountInWei={tx.fromValue} currency={tx.fromToken} />
        </div>
        <div css={style.value}>
          <span css={style.amountLabel}>Out: </span>
          <MoneyValue amountInWei={tx.toValue} currency={tx.toToken} />
        </div>
      </TransactionProperty>
      <TransactionProperty label="Fee">
        <div css={style.value}>
          <MoneyValue amountInWei={feeValue} currency={feeCurrency} />
        </div>
      </TransactionProperty>
      <TransactionProperty label="Rate">
        <div css={style.value}>
          <MoneyValue amountInWei={rate.weiRate} currency={Currency.CELO} />
          <span css={style.rateDivider}> : </span>
          <MoneyValue amountInWei={rate.weiBasis} currency={Currency.cUSD} />
        </div>
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
