import { ReactElement } from 'react'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Styles } from 'src/styles/types'

export interface TransparentIconButtonProps {
  icon: string | ReactElement
  onClick: () => void
  styles?: Styles
  iconStyles?: Styles
  margin?: string | number
  title?: string
  color?: 'light' | 'dark'
}

export function TransparentIconButton(props: TransparentIconButtonProps) {
  const { icon, onClick, styles, iconStyles, margin, title, color } = props
  const primaryStyle = color === 'light' ? defaultStyleLight : defaultStyle

  return (
    <button css={{ ...primaryStyle, margin, ...styles }} onClick={onClick} title={title}>
      {typeof icon === 'string' ? <img src={icon} css={iconStyles} /> : icon}
    </button>
  )
}

const base: Styles = {
  ...transparentButtonStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const defaultStyle: Styles = {
  ...base,
  opacity: 0.9,
  ':hover': {
    filter: 'brightness(2.5)',
  },
  ':active': {
    filter: 'brightness(1.5)',
  },
}

const defaultStyleLight: Styles = {
  ...base,
  filter: 'brightness(6)',
  ':hover': {
    filter: 'brightness(5)',
  },
  ':active': {
    filter: 'brightness(4)',
  },
}
