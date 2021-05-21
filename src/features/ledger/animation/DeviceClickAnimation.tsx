import { css, keyframes } from '@emotion/react'
import { memo } from 'react'
import { DeviceColor } from 'src/features/ledger/animation/DeviceColors'
import { NanoXFrame } from 'src/features/ledger/animation/NanoXFrame'
import { NanoXScreen } from 'src/features/ledger/animation/NanoXScreen'

// Mostly taken from https://github.com/LedgerHQ/ledger-live-desktop/tree/develop/src/renderer/icons/device/interactions/NanoX
function _DeviceClickAnimation() {
  return (
    <svg width="180px" height="100px" viewBox="0 0 156 42" css={{ overflow: 'visible' }}>
      <g className="click" css={clickStyle}>
        <ClickLines x="0" />
        <ClickLines x="115" />
      </g>
      <g className="device">
        <NanoXFrame y="34" x="5">
          <NanoXScreen x="41" y="50%" fadein={false} />
        </NanoXFrame>
      </g>
    </svg>
  )
}

function ClickLines({ x }: { x: string }) {
  return (
    <svg
      x={x}
      width="48"
      height="26"
      viewBox="0 0 48 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="24.0498"
        y1="1.25"
        x2="24.0498"
        y2="21.75"
        stroke={DeviceColor.Dark}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="45.4004"
        y1="8.91776"
        x2="30.1976"
        y2="24.1206"
        stroke={DeviceColor.Dark}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="2.66816"
        y1="9"
        x2="17.871"
        y2="24.2028"
        stroke={DeviceColor.Dark}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const clickAnim = keyframes`
  0% { opacity: 0.05; transform: translate(0, 0); }
  50% { opacity: 0.5; transform: translate(0, -4px); }
  100% { opacity: 0.7; transform: translate(0, -4px); }
`

const clickStyle = css({
  animation: `${clickAnim} cubic-bezier(0.22, 0.61, 0.36, 1) 3000ms infinite`,
})

export const DeviceClickAnimation = memo(_DeviceClickAnimation)
