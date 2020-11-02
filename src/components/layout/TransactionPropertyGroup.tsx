import { PropsWithChildren } from 'react'
import { Stylesheet } from 'src/styles/types'

export function TransactionPropertyGroup(props: PropsWithChildren<any>) {
  return <div css={style.container}>{props.children}</div>
}
const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '3em 1em',
    marginBottom: '2em',
  },
}
