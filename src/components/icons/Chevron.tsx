import { memo } from 'react'
import Chevron from 'src/components/icons/chevron.svg'
import { Styles } from 'src/styles/types'

interface Props {
  width: string | number
  height: string | number
  direction: 'n' | 'e' | 's' | 'w'
  styles?: Styles
}

function _ChevronIcon({ width, height, direction, styles }: Props) {
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
    <img
      src={Chevron}
      width={width}
      height={height}
      css={{ transform: `rotate(${degree})`, ...styles }}
      alt="chevron"
    />
  )
}

export const ChevronIcon = memo(_ChevronIcon)
