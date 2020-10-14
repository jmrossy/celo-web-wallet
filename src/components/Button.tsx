import React from 'react'
import { Color } from 'src/components/Color'

interface ButtonProps {
  size?: 's' | 'm' | 'l' // defaults to 'm'
  color?: Color // defaults to primaryGreen
  margin?: string
  onClick: () => void
}

export function Button(props: React.PropsWithChildren<ButtonProps>) {
  const { size, color, margin, onClick } = props
  const { height, width } = getDimensions(size)
  return (
    <button
      css={{
        backgroundColor: color || Color.primaryGreen,
        margin,
        height,
        width,
        borderRadius: 3,
        color: Color.primaryWhite,
        border: 'none',
      }}
      onClick={onClick}
    >
      {props.children}
    </button>
  )
}

function getDimensions(size?: string) {
  switch (size) {
    case 's':
      return { height: 36, width: 150 }
    case 'm':
    case undefined:
      return { height: 52, width: 200 }
    case 'l':
      return { height: 265, width: 268 }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}
