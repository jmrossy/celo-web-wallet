import { memo } from 'react'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  color?: string
  styles?: Styles
}

function _KeyIcon({ width, height, color, styles }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="16.4 -0.2 424 453.9"
      width={width ?? 18}
      height={height ?? 18}
      css={styles}
    >
      <path
        fill={color ?? '#FFF'}
        d="M205 342l-32-32.2 110.6-110.7a105.8 105.8 0 00125.3-168 105.8 105.8 0 00-168 125.2l-218 218A30.4 30.4 0 0065.6 417l32.2 32.2c6 5.9 15.5 5.9 21.4 0l21.5-21.5a15 15 0 000-21.4l-32.2-32.2 21.5-21.5 32 32.4c6 6 15.6 6 21.5 0l21.4-21.4c6-6 6-15.5 0-21.5zm96.5-268a45.6 45.6 0 1164.4 64.4A45.6 45.6 0 01301.5 74z"
      />
    </svg>
  )
}

export const KeyIcon = memo(_KeyIcon)
