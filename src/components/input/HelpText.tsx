import { PropsWithChildren } from 'react'
import { Color } from 'src/styles/Color'

interface HelpTextProps {
  color?: Color
  margin?: string
}

export const HelpText = (props: PropsWithChildren<HelpTextProps>) => {
  const { color, margin, children } = props

  return (
    <span
      css={{
        color: color ?? Color.textError,
        fontSize: '0.9rem',
        margin: margin ?? '4px 0 -1.3em 0',
      }}
    >
      {children}
    </span>
  )
}
