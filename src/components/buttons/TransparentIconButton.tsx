import { ReactElement, useMemo } from 'react'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { Styles } from 'src/styles/types'

export interface TransparentIconButtonProps {
  icon: string | ReactElement
  onClick: () => void
  title?: string
  margin?: string | number
  color?: 'light' | 'dark'
  opacity?: number
  styles?: Styles // button style overrides
  iconStyles?: Styles // img style overrides
}

export function TransparentIconButton(props: TransparentIconButtonProps) {
  const { icon, onClick, title, margin, color, opacity, styles, iconStyles } = props

  const buttonStyle = useMemo(() => {
    const defaults = color === 'light' ? defaultStyleLight : defaultStyle
    return {
      ...defaults,
      opacity: opacity ?? defaults.opacity,
      margin,
      ...styles,
    }
  }, [margin, color, opacity, styles])

  return (
    <button css={buttonStyle} onClick={onClick} title={title} type="button">
      {typeof icon === 'string' ? <img src={icon} css={iconStyles} /> : icon}
    </button>
  )
}

const baseStyle: Styles = {
  ...transparentButtonStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const defaultStyle: Styles = {
  ...baseStyle,
  opacity: 0.9,
  ':hover': {
    filter: 'brightness(2.5)',
  },
  ':active': {
    filter: 'brightness(1.5)',
  },
}

const defaultStyleLight: Styles = {
  ...baseStyle,
  opacity: 1,
  filter: 'brightness(6)',
  ':hover': {
    filter: 'brightness(5)',
  },
  ':active': {
    filter: 'brightness(4)',
  },
}
