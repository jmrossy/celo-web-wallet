import { memo } from 'react'
import Celo_Elipse from 'src/components/icons/celo_elipse.svg'

function _CheckmarkIcon({ fill }: { fill: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 43.3">
      <path fill={fill} d="M20.8 42.3L.7 27.2l6-8 12.2 9.1L39.3 1.1l8 6z" />
    </svg>
  )
}

export const CheckmarkIcon = memo(_CheckmarkIcon)

function _CheckmarkInElipseIcon() {
  return (
    <div css={{ position: 'relative' }}>
      <img src={Celo_Elipse} alt="checkmark in elipse" css={{ height: '8em' }} />
      <div css={{ position: 'absolute', top: '35%', left: '29%', width: '2.7em' }}>
        <CheckmarkIcon fill="#FFFFFF" />
      </div>
    </div>
  )
}

export const CheckmarkInElipseIcon = memo(_CheckmarkInElipseIcon)
