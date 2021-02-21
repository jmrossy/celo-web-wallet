import { memo } from 'react'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  direction: 'n' | 'e' | 's' | 'w'
  color?: string
  styles?: Styles
}

function _ChevronIcon({ width, height, direction, color, styles }: Props) {
  let degree: string
  switch (direction) {
    case 'n':
      degree = '180deg'
      break
    case 'e':
      degree = '270deg'
      break
    case 's':
      degree = '0deg'
      break
    case 'w':
      degree = '90deg'
      break
    default:
      throw new Error(`Invalid chevron direction ${direction}`)
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 8"
      css={{ transform: `rotate(${degree})`, ...styles }}
    >
      <path
        d="M1 1l6 6 6-6"
        strokeWidth="2"
        stroke={color || '#2E3338'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const ChevronIcon = memo(_ChevronIcon)
