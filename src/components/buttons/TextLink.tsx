import { PropsWithChildren } from 'react'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Font } from 'src/styles/fonts'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  link: string
  styles?: Styles
}

export function TextLink(props: PropsWithChildren<ButtonProps>) {
  const { styles } = props

  return (
    <a css={[defaultStyle, styles]} href={props.link} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  )
}

const defaultStyle: Styles = {
  ...transparentButtonStyles,
  ...Font.linkLight,
}
