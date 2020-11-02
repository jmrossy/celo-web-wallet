import { getTransactionFee } from 'src/blockchain/gas'
import { Address } from 'src/components/Address'
import { TransactionPropertyGroup } from 'src/components/layout/TransactionPropertyGroup'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { TokenTransfer } from 'src/features/feed/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Props {
  tx: TokenTransfer
}

export function TokenTransferReview({ tx }: Props) {
  const { time, date } = getFormattedTime(tx.timestamp)

  const amountLabel = tx.isOutgoing ? 'Sent: ' : 'Received: '
  const addressLabel = tx.isOutgoing ? 'Recipient' : 'Sender'
  const address = tx.isOutgoing ? tx.to : tx.from

  const { feeValue, feeCurrency } = getTransactionFee(tx)

  return (
    <TransactionPropertyGroup>
      <div>
        <div css={Font.label}>Status</div>
        <div css={style.value}>{`Confirmed: ${time}`} </div>
        <div css={style.value}>{date} </div>
      </div>
      <div>
        <div css={Font.label}>Amount</div>
        <div css={[style.value, Font.bold]}>
          <span>{amountLabel}</span>
          <MoneyValue amountInWei={tx.value} currency={Currency.cUSD} />
        </div>
        <div css={style.value}>
          <span>Fee paid: </span>
          <MoneyValue amountInWei={feeValue} currency={feeCurrency} />
        </div>
      </div>
      <div>
        <div css={Font.label}>{addressLabel}</div>
        <div css={style.value}>
          <Address address={address} />
        </div>
      </div>
      {tx.comment && (
        <div>
          <div css={Font.label}>Comment</div>
          <div css={style.value}>{tx.comment} </div>
        </div>
      )}
    </TransactionPropertyGroup>
  )
}

function getFormattedTime(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return { time: date.toLocaleTimeString(), date: date.toDateString() }
}

const style: Stylesheet = {
  value: {
    ...Font.body,
    marginTop: '0.75em',
  },
}
