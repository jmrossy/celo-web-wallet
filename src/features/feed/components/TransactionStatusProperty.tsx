import { TextLink } from 'src/components/buttons/TextLink'
import { config } from 'src/config'
import { TransactionProperty } from 'src/features/feed/components/TransactionPropertyGroup'
import { CeloTransaction } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'

export function TransactionStatusProperty({ tx }: { tx: CeloTransaction }) {
  const { time, date } = getFormattedTime(tx.timestamp)

  return (
    <TransactionProperty label="Status">
      <div css={style.value}>{`Confirmed at ${time}`} </div>
      <div css={style.value}>{date} </div>
      <div css={[style.value, style.link]}>
        <TextLink link={`${config.blockscoutUrl}/tx/${tx.hash}`}>View on Celo Explorer</TextLink>
      </div>
    </TransactionProperty>
  )
}

function getFormattedTime(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return {
    time: date.toLocaleTimeString(),
    date: date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

const style: Stylesheet = {
  value: {
    marginTop: '1em',
  },
  link: {
    fontSize: '0.9em',
  },
}
