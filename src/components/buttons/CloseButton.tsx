import { TransparentIconButton, TransparentIconButtonProps } from './TransparentIconButton'
import CloseIcon from '../icons/close.svg'

export function CloseButton(props: Omit<TransparentIconButtonProps, 'icon'>) {
  const { onClick, styles, iconStyles, margin, title, color } = props

  return (
    <TransparentIconButton
      icon={CloseIcon}
      styles={styles}
      iconStyles={iconStyles}
      color={color}
      margin={margin}
      onClick={onClick}
      title={title || 'Close'}
    />
  )
}
