import { getTransactionFee } from 'src/blockchain/gas'
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
    <div css={style.container}>
      <div css={style.propertyGroup}>
        <div css={Font.label}>Status</div>
        <div css={style.value}>{`Confirmed: ${time}`} </div>
        <div css={style.value}>{date} </div>
      </div>
      <div css={style.propertyGroup}>
        <div css={Font.label}>Amount</div>
        <div css={style.value}>
          <span>{amountLabel}</span>
          <MoneyValue amountInWei={tx.value} currency={Currency.cUSD} />
        </div>
        <div css={style.value}>
          <span>Fee paid: </span>
          <MoneyValue amountInWei={feeValue} currency={feeCurrency} />
        </div>
      </div>
      <div css={style.propertyGroup}>
        <div css={Font.label}>{addressLabel}</div>
        <div css={style.value}>{address} </div>
      </div>
      {tx.comment && (
        <div css={style.propertyGroup}>
          <div css={Font.label}>Comment</div>
          <div css={style.value}>{tx.comment} </div>
        </div>
      )}
    </div>
  )
}

function getFormattedTime(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return { time: date.toLocaleTimeString(), date: date.toDateString() }
}

const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '3em 1em',
    marginBottom: '2em',
  },
  value: {
    ...Font.body,
    marginTop: '0.75em',
  },
}
