import { memo } from 'react'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  direction: 'n' | 'e' | 's' | 'w'
  color?: string
  styles?: Styles
}

function _ArrowIcon({ width, height, direction, color, styles }: Props) {
  let degree: string
  switch (direction) {
    case 'n':
      degree = '90deg'
      break
    case 'e':
      degree = '180deg'
      break
    case 's':
      degree = '270deg'
      break
    case 'w':
      degree = '0deg'
      break
    default:
      throw new Error(`Invalid arrow direction ${direction}`)
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width ?? 24}
      height={height ?? 24}
      css={{ transform: `rotate(${degree})`, ...styles }}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
        fill={color ?? '#FFFFFF'}
      />
    </svg>
  )
}

export const ArrowIcon = memo(_ArrowIcon)
