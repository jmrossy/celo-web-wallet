import { memo } from 'react'
import { Styles } from 'src/styles/types'

interface Props {
  width?: string | number
  height?: string | number
  color?: string
  styles?: Styles
}

function _PencilIcon({ width, height, color, styles }: Props) {
  return (
    <svg
      width={width ?? 13}
      height={height ?? 13}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      css={styles}
    >
      <path
        d="M1.16 8.35l.16-.33c-.06.05.05-.06 0 0l6.73-6.97A2.89 2.89 0 0110.41 0c.64 0 1.3.24 1.86.81.49.49.73 1.05.73 1.7 0 .81-.4 1.62-1.14 2.35L4.9 11.91a.65.65 0 01-.16.08.65.65 0 01-.16.08l-3.65.9a.73.73 0 01-.73-.17.81.81 0 01-.16-.73l1.13-3.72zm2.74 2.34l6.91-6.8c.49-.49.73-.97.73-1.38a.74.74 0 00-.32-.65c-.25-.24-.49-.4-.81-.4-.41 0-.9.32-1.3.65L2.46 8.9l.79.84.65.94z"
        fill={color ?? '#FFF'}
      />
    </svg>
  )
}

export const PencilIcon = memo(_PencilIcon)
