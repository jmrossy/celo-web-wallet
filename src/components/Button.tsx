import React from 'react'
import { Color } from 'src/components/Color'

interface ButtonProps {
  size?: 's' | 'm' | 'l' // defaults to 'm'
  type?: 'submit' | 'reset' | 'button'
  color?: Color // defaults to primaryGreen
  margin?: string | number
  onClick?: () => void
}

export function Button(props: React.PropsWithChildren<ButtonProps>) {
  const { size, type, color, margin, onClick } = props
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
      type={type}
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
      return { height: 68, width: 265 }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}
