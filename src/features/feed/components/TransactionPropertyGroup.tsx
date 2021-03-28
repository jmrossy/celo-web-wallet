import { PropsWithChildren } from 'react'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function TransactionPropertyGroup(props: PropsWithChildren<any>) {
  return <div css={style.propertyGroup}>{props.children}</div>
}

export function TransactionProperty(props: PropsWithChildren<{ label: string }>) {
  return (
    <div css={style.property}>
      <div css={style.label}>{props.label}</div>
      <div css={style.value}>{props.children}</div>
    </div>
  )
}

const style: Stylesheet = {
  propertyGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20em, auto))',
    gap: '2em 2em',
    maxWidth: '60em',
  },
  property: {
    padding: '1.2em',
    backgroundColor: Color.primaryWhite,
    borderRadius: 6,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    [mq[1200]]: {
      padding: '1.4em',
    },
  },
  label: {
    ...Font.label,
    marginBottom: '1em',
  },
  value: {
    ...Font.body,
  },
}
