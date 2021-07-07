import { PropsWithChildren } from 'react'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  onClick: () => void
  margin?: string | number
  disabled?: boolean
  styles?: Styles
  title?: string
}

export function DashedBorderButton(props: PropsWithChildren<ButtonProps>) {
  const { margin, onClick, disabled, styles, title, children } = props
  return (
    <button
      css={{ ...defaultStyle, margin, ...styles }}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

const defaultStyle: Styles = {
  ...transparentButtonStyles,
  width: '100%',
  padding: '0.7em 1em',
  fontSize: '0.95em',
  borderRadius: 4,
  color: Color.primaryBlack,
  ':hover': {
    backgroundColor: Color.fillLighter,
  },
  ':active': {
    backgroundColor: Color.fillLight,
  },
  // This creates a dashed line border but with wider spaces btwn dashes than default browser style
  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%232E3338cc' stroke-width='1' stroke-dasharray='5' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
}
