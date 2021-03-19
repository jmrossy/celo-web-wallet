import { Address } from 'src/components/Address'
import { Box } from 'src/components/layout/Box'
import { MoneyValue } from 'src/components/MoneyValue'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { TransactionStatusProperty } from 'src/features/feed/components/TransactionStatusProperty'
import { getFeeFromConfirmedTx } from 'src/features/fees/utils'
import { EscrowTransaction, TokenTransfer } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'

interface Props {
  tx: TokenTransfer | EscrowTransaction
}

export function TokenTransferReview({ tx }: Props) {
  const amountLabel = tx.isOutgoing ? 'Sent: ' : 'Received: '
  const addressLabel = tx.isOutgoing ? 'Sent To' : 'Received From'
  const address = tx.isOutgoing ? tx.to : tx.from

  const { feeValue, feeCurrency } = getFeeFromConfirmedTx(tx)

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label={addressLabel}>
        <div css={style.value}>
          <Address address={address} buttonType="send" />
        </div>
      </TransactionProperty>
      <TransactionProperty label="Amount">
        <Box styles={style.value}>
          <span css={style.amountLabel}>{amountLabel}</span>
          <MoneyValue amountInWei={tx.value} token={tx.token} />
        </Box>
        {tx.isOutgoing && (
          <Box styles={style.value}>
            <span css={style.amountLabel}>Fee: </span>
            <MoneyValue amountInWei={feeValue} token={feeCurrency} />
          </Box>
        )}
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
    marginTop: '0.75em',
  },
  amountLabel: {
    display: 'inline-block',
    minWidth: '5em',
  },
}
