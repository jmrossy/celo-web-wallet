import { Address } from 'src/components/Address'
import { MoneyValue } from 'src/components/MoneyValue'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { TokenTransfer } from 'src/features/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Props {
  tx: TokenTransfer
}

export function TokenTransferReview({ tx }: Props) {
  const amountLabel = tx.isOutgoing ? 'Sent: ' : 'Received: '
  const addressLabel = tx.isOutgoing ? 'Recipient' : 'Sender'
  const address = tx.isOutgoing ? tx.to : tx.from

  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Amount">
        <div css={[style.value, Font.bold]}>
          <span>{amountLabel}</span>
          <MoneyValue amountInWei={tx.value} currency={tx.currency} />
        </div>
        <div css={style.value}>
          <span>Fee: </span>
          <MoneyValue amountInWei={feeValue} currency={feeCurrency} />
        </div>
      </TransactionProperty>
      <TransactionProperty label={addressLabel}>
        <div css={style.value}>
          <Address address={address} />
        </div>
      </TransactionProperty>
      {tx.comment && (
        <TransactionProperty label="Comment">
          <div css={style.value}>{tx.comment} </div>
        </TransactionProperty>
      )}
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  value: {
    ...Font.body,
    marginTop: '0.75em',
  },
}
