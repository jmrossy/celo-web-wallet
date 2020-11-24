import { PropsWithChildren } from 'react'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function TransactionPropertyGroup(props: PropsWithChildren<any>) {
  return <div css={style.container}>{props.children}</div>
}

export function TransactionProperty(props: PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <div css={style.label}>{props.label}</div>
      <div css={style.value}>{props.children}</div>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '3em 1em',
  },
  label: {
    ...Font.label,
    marginBottom: '0.8em',
  },
  value: {
    ...Font.body,
  },
}
