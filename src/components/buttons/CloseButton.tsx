import {
  TransparentIconButton,
  TransparentIconButtonProps,
} from 'src/components/buttons/TransparentIconButton'
import { XIcon } from 'src/components/icons/X'

export function CloseButton(props: Omit<TransparentIconButtonProps, 'icon'>) {
  const { onClick, styles, iconStyles, margin, title, color } = props

  return (
    <TransparentIconButton
      icon={<XIcon styles={iconStyles} />}
      styles={styles}
      color={color}
      margin={margin}
      onClick={onClick}
      title={title || 'Close'}
    />
  )
}
