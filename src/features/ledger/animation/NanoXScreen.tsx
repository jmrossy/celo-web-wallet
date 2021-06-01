import { css, keyframes } from '@emotion/react'
import { DeviceColor } from 'src/features/ledger/animation/DeviceColors'
import { Color } from 'src/styles/Color'

interface Props {
  fadein: boolean
  x?: string
  y?: string
}

export function NanoXScreen(props: Props) {
  const { x, y, fadein } = props
  return (
    <svg x={x} y={y} width="70" height="31" css={{ overflow: 'visible' }}>
      <defs />
      <g id="NanoXScreen-screen" css={{ transform: 'translate(0%, -50%)' }}>
        <rect
          width="65"
          height="29"
          x="40.5"
          y="6.5"
          fill={DeviceColor.FillLight}
          stroke={DeviceColor.FillLight}
          rx="2"
          transform="translate(-40 -6)"
        />
        <g id="NanoXScreen-screen-content">
          <svg
            height="18"
            width="18"
            viewBox="0 0 950 950"
            x="25"
            y="6"
            css={fadein ? coinStyle : undefined}
          >
            <defs />
            <path
              fill={Color.primaryGreen}
              d="M375 850a275 275 0 100-550 275 275 0 000 550zm0 100a375 375 0 110-750 375 375 0 010 750z"
            />
            <path
              fill={Color.primaryGreen}
              d="M575 650a275 275 0 100-550 275 275 0 000 550zm0 100a375 375 0 110-750 375 375 0 010 750z"
            />
          </svg>
        </g>
      </g>
    </svg>
  )
}

const coinFadeAnim = keyframes`
  0% { opacity: 0; }
  50% { opacity: 0; } 
  90% { opacity: 1; }
  100% { opacity: 0; }
`

const coinStyle = css({
  animation: `${coinFadeAnim} ease 6000ms infinite`,
})
