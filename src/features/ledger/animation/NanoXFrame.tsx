import { PropsWithChildren } from 'react'
import { DeviceColor } from 'src/features/ledger/animation/DeviceColors'

interface Props {
  x?: string
  y?: string
}

export function NanoXFrame(props: PropsWithChildren<Props>) {
  const { x, y, children } = props
  return (
    <svg width="156" height="42" x={x} y={y}>
      <defs />
      <defs>
        <circle id="NanoXFrame-a" cx="135" cy="21" r="11" />
      </defs>
      <g fill="none" fillRule="evenodd">
        <rect
          width="154"
          height="40"
          x="1"
          y="1"
          fill={DeviceColor.FillLight}
          stroke={DeviceColor.Dark}
          strokeWidth="2"
          rx="4"
        />
        <circle cx="21" cy="21" r="10.5" stroke={DeviceColor.Dark} strokeLinejoin="miter" />
        <circle cx="21" cy="21" r="11.5" stroke={DeviceColor.Dark} opacity={0.4} />
        {children}
        <g>
          <use fill="#131415" xlinkHref="#NanoXFrame-a" />
          <circle
            cx="135"
            cy="21"
            r="11.5"
            fill={DeviceColor.Dark}
            stroke={DeviceColor.MediumDark}
          />
        </g>
      </g>
    </svg>
  )
}
