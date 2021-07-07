import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface BackdropProps {
  opacity?: number
  color?: string | Color
  onClick?: () => void
}

export const Backdrop = (props: BackdropProps) => {
  const { opacity, color, onClick } = props

  return (
    <div
      css={[style, { opacity: opacity ?? 0.8, backgroundColor: color || Color.primaryWhite }]}
      onClick={onClick}
    />
  )
}

export const backdropZIndex = 999

const style: Styles = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  backgroundColor: '#FFF', //semi-transparent white
  zIndex: backdropZIndex,
}
