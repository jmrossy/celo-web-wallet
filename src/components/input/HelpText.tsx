import { PropsWithChildren } from 'react'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface HelpTextProps {
  color?: Color
  margin?: string
  styles?: Styles
}

export const HelpText = (props: PropsWithChildren<HelpTextProps>) => {
  const { color, margin, styles, children } = props

  return (
    <span
      css={{
        color: color ?? Color.textError,
        fontSize: '0.9rem',
        margin: margin ?? '4px 0 -1.3em 0',
        ...styles,
      }}
    >
      {children}
    </span>
  )
}
