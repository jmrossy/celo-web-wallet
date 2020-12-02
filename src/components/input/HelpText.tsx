import { PropsWithChildren } from 'react'
import { Color } from 'src/styles/Color'

interface HelpTextProps {
  color?: Color
}

export const HelpText = (props: PropsWithChildren<HelpTextProps>) => {
  const { color, children } = props

  return (
    <span
      css={{
        color: color ?? Color.textError,
        marginTop: 4,
        fontSize: '0.9rem',
        marginBottom: '-1.3em',
      }}
    >
      {children}
    </span>
  )
}
