import { MoneyValue } from 'src/components/MoneyValue'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { TokenExchangeTx } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'

interface Props {
  tx: TokenExchangeTx
}

export function TokenExchangeReview({ tx }: Props) {
  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Amount">
        <div css={style.value}>
          <MoneyValue amountInWei={tx.fromValue} currency={tx.fromToken} />
          <span> to </span>
          <MoneyValue amountInWei={tx.toValue} currency={tx.toToken} />
        </div>
        <div css={style.value}>
          <span>Fee: </span>
          <MoneyValue amountInWei={feeValue} currency={feeCurrency} />
        </div>
      </TransactionProperty>
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  value: {
    marginTop: '0.75em',
  },
}
