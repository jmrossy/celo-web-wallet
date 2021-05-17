import { PropsWithChildren } from 'react'
import { Button } from 'src/components/buttons/Button'
import CloseIcon from 'src/components/icons/close.svg'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  onClick: () => void
  styles?: Styles
  iconStyles?: Styles
  title?: string
}

export function CloseButton(props: PropsWithChildren<ButtonProps>) {
  const { onClick, styles, iconStyles, title } = props

  return (
    <Button
      size="icon"
      icon={CloseIcon}
      styles={{ ...defaultStyle, ...styles }}
      iconStyles={iconStyles}
      onClick={onClick}
      title={title || 'Close'}
    />
  )
}

const defaultStyle: Styles = {
  backgroundColor: 'transparent',
  opacity: 0.9,
  ':hover': {
    backgroundColor: 'transparent',
    filter: 'brightness(2.5)',
  },
  ':active': {
    backgroundColor: 'transparent',
  },
}
