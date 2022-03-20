import { memo } from 'react'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  color?: string
  styles?: Styles
}

function _XIcon({ width, height, color, styles }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width ?? 24}
      height={height ?? 24}
      css={styles}
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        fill={color ?? Color.primaryBlack}
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      />
    </svg>
  )
}

export const XIcon = memo(_XIcon)
