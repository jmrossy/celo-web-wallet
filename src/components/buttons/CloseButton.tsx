import {
  TransparentIconButton,
  TransparentIconButtonProps,
} from 'src/components/buttons/TransparentIconButton'
import CloseIcon from 'src/components/icons/close.svg'

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
