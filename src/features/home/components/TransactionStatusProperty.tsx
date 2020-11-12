import { TransactionProperty } from 'src/features/home/components/TransactionPropertyGroup'
import { CeloTransaction } from 'src/features/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function TransactionStatusProperty({ tx }: { tx: CeloTransaction }) {
  const { time, date } = getFormattedTime(tx.timestamp)

  return (
    <TransactionProperty label="Status">
      <div css={style.value}>{`Confirmed: ${time}`} </div>
      <div css={style.value}>{date} </div>
    </TransactionProperty>
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
