import { Button } from 'src/components/Button'
import CloseIcon from 'src/components/icons/close.svg'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  onClick: () => void
  styles?: Styles
}

export function CloseButton(props: React.PropsWithChildren<ButtonProps>) {
  const { onClick, styles } = props

  return (
    <Button
      size="icon"
      icon={CloseIcon}
      styles={{ ...defaultStyle, ...styles }}
      onClick={onClick}
    />
  )
}

const defaultStyle: Styles = {
  backgroundColor: 'transparent',
  ':hover': {
    backgroundColor: 'transparent',
    filter: 'brightness(2.5)',
  },
  ':active': {
    backgroundColor: 'transparent',
  },
}
