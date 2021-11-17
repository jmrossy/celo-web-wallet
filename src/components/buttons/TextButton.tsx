import { PropsWithChildren } from 'react'
import { transparentButtonStyles } from './Button'
import { Font } from '../../styles/fonts'
import { Styles } from '../../styles/types'

interface ButtonProps {
  onClick: () => void
  styles?: Styles
}

export function TextButton(props: PropsWithChildren<ButtonProps>) {
  const { onClick, styles } = props

  return (
    <button css={[defaultStyle, styles]} onClick={onClick} type="button">
      {props.children}
    </button>
  )
}

const defaultStyle: Styles = {
  ...transparentButtonStyles,
  ...Font.linkLight,
}
