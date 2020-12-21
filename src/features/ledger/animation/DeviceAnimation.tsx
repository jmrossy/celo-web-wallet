import { memo } from 'react'
import { NanoXFrame } from 'src/features/ledger/animation/NanoXFrame'
import { NanoXScreen } from 'src/features/ledger/animation/NanoXScreen'
import { UsbCable } from 'src/features/ledger/animation/UsbCable'

interface Props {
  xOffset?: number
}

// Mostly taken from https://github.com/LedgerHQ/ledger-live-desktop/tree/develop/src/renderer/icons/device/interactions/NanoX
function _DeviceAnimation({ xOffset = 0 }: Props) {
  return (
    <svg width="156px" height="42px" viewBox="0 0 156 42" css={{ overflow: 'visible' }}>
      <g className="device" transform={`translate(${xOffset}, 0)`}>
        <UsbCable x="-112" y="9" />
        <NanoXFrame>
          <NanoXScreen x="41" y="50%" />
        </NanoXFrame>
      </g>
    </svg>
  )
}

export const DeviceAnimation = memo(_DeviceAnimation)
