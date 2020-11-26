import { PropsWithChildren } from 'react'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

interface BackdropProps {
  opacity?: number
  color?: string | Color
  onClick: () => void
}

export const Backdrop = (props: PropsWithChildren<BackdropProps>) => {
  const { opacity, color, onClick } = props

  return (
    <div
      css={[
        style.backdrop,
        { opacity: opacity ?? 0.8, backgroundColor: color || Color.primaryWhite },
      ]}
      onClick={onClick}
    />
  )
}

export const backdropZIndex = 99

const style: Stylesheet = {
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: '#FFF', //semi-transparent white
    zIndex: backdropZIndex,
  },
}
