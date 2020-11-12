import { MoneyValue } from 'src/components/MoneyValue'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/home/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/home/components/TransactionStatusProperty'
import { TokenExchangeTx } from 'src/features/types'
import { Font } from 'src/styles/fonts'
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
        <div css={[style.value, Font.bold]}>
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
    ...Font.body,
    marginTop: '0.75em',
  },
}
