import { css, keyframes } from '@emotion/react'
import { DeviceColor } from 'src/features/ledger/animation/DeviceColors'

interface Props {
  x?: string
  y?: string
}

export function UsbCable(props: Props) {
  return (
    <svg {...props} width="126" height="23" css={style}>
      <defs>
        <linearGradient id="USBCableSvg-gradient">
          <stop offset="0" stopColor="black" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="USBCableSvg-myMask">
          <rect x="10" y="0" width="25" height="25" fill="url(#USBCableSvg-gradient)" />
          <rect x="35" y="0" width="75" height="25" fill="white" />
        </mask>
      </defs>
      <g mask="url(#USBCableSvg-myMask)">
        <g css={style} fill="none" fillRule="evenodd">
          <path
            fill={DeviceColor.Dark}
            fillRule="nonzero"
            d="M68 14l-68 .00125V16h68v-2zm0-7H0v2h68V7z"
          />
          <path
            stroke={DeviceColor.Dark}
            strokeWidth="2"
            d="M83 16.5H69.8285715C69.3709641 16.5 69 16.1290359 69 15.6714285v-8.342857C69 6.8709641 69.3709641 6.5 69.8285715 6.5H83v10z"
          />
          <g>
            <path
              stroke={DeviceColor.Dark}
              strokeWidth="2"
              d="M112 4.5h11c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-11 0v-14zM112 19c0 1.65685425-1.34314575 3-3 3H88c-2.7614237 0-5-2.23857625-5-5V6c0-2.7614237 2.2385763-5 5-5h21c1.65685425 0 3 1.3431458 3 3v15z"
            />
            <path
              stroke={DeviceColor.Dark}
              strokeLinecap="square"
              d="M116 7.61111111h6M116 15.3888889h6"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}

const plugAnim = keyframes`
  0% { transform: translate(0px, 0px); opacity: 0; }
  60% { transform: translate(0px, 0px); opacity: 1; }
  85% { transform: translate(-50px, 0px); opacity: 1; }
  100% { transform: translate(-50px, 0px); opacity: 0; }
`

const style = css({
  animation: `${plugAnim} ease 6000ms infinite reverse`,
})
