import { memo } from 'react'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  color?: string
  styles?: Styles
}

function _PlusIcon({ width, height, color, styles }: Props) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      width={width ?? 22}
      height={height ?? 22}
      css={styles}
    >
      <rect x="9.6" width="3.2" height="22" rx="1" fill={color ?? '#FFF'} />
      <rect
        x="22"
        y="9.4"
        width="3.2"
        height="22"
        rx="1"
        transform="rotate(90 22 9.4)"
        fill={color ?? '#FFF'}
      />
    </svg>
  )
}

export const PlusIcon = memo(_PlusIcon)
