import { memo } from 'react'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  color?: string
  styles?: Styles
}

function _LedgerIcon({ width, height, color, styles }: Props) {
  return (
    <svg
      viewBox="0 0 19.9 19.9"
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 17}
      height={height ?? 17}
      css={styles}
    >
      <g fill={color ?? '#FFF'}>
        <path d="M16.7 0H7.6v12.3h12.3V3.2A3.2 3.2 0 0016.7 0z" />
        <path d="M4.8 0H3.1A3.2 3.2 0 000 3.2v1.5h4.8z" />
        <path d="M0 7.6h4.8v4.7H0V7.6z" />
        <path d="M15.2 19.9h1.6a3.2 3.2 0 003.1-3.2v-1.5h-4.7z" />
        <path d="M7.6 15.2h4.7v4.7H7.6v-4.7z" />
        <path d="M0 15.2v1.6a3.2 3.2 0 003.2 3.1h1.5v-4.7z" />
      </g>
    </svg>
  )
}

export const LedgerIcon = memo(_LedgerIcon)
