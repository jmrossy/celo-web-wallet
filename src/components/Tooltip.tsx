import { useRef, useState } from 'react'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { useTimeout } from 'src/utils/time'

export type TipPositions =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topRight'
  | 'topLeft'
  | 'bottomRight'
  | 'bottomLeft'

export interface TooltipProps {
  content: any
  delay?: number
  margin?: string | number
  position?: TipPositions
  variant?: 'light' | 'dark'
}

//Inspiration from: https://dev.to/vtrpldn/how-to-make-an-extremely-reusable-tooltip-component-with-react-and-nothing-else-3pnk
export const Tooltip = ({
  content,
  margin,
  position,
  delay,
  variant,
  children,
}: React.PropsWithChildren<TooltipProps>) => {
  const [isShowing, setShowing] = useState(false)
  const [wait, setWait] = useState<number>(-1)

  const cancel = useRef<any>()
  cancel.current = useTimeout(() => setShowing(true), wait)

  const onEnter = () => {
    setWait(delay || 200)
  }

  const onLeave = () => {
    setShowing(false)
    if (cancel.current) cancel.current()
    setWait(-1)
  }

  const color = variant === 'dark' ? tipStyles.dark : {}

  return (
    <div css={{ ...tipStyles.wrapper, margin }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {isShowing && (
        <div css={{ ...tipStyles.tooltip, ...positionStyle(position), ...color }}>{content}</div>
      )}
    </div>
  )
}

const tipYMargin = '2.25em'
const tipXMargin = '0.5em'

const tipStyles: Stylesheet = {
  wrapper: {
    border: '1px solid transparent',
    display: 'inline-block',
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    whiteSpace: 'nowrap',
    padding: '0.25em 1em',
    border: `1px solid ${Color.borderMedium}`,
    borderRadius: 5,
    backgroundColor: Color.fillLight,
    color: Color.primaryBlack,
    boxShadow: '0px 3px 4px 0px rgba(0, 0, 0, 0.15)',
  },
  top: {
    top: `calc(${tipYMargin} * -1)`,
  },
  bottom: {
    bottom: `calc(${tipYMargin} * -1)`,
  },
  left: {
    left: 'auto',
    right: `calc(100% + ${tipXMargin})`,
    top: '50%',
    transform: 'translateX(0) translateY(-50%)',
  },
  right: {
    left: `calc(100% + ${tipXMargin})`,
    top: '50%',
    transform: 'translateX(0) translateY(-50%)',
  },
  leftOnly: {
    left: 'auto',
    right: `calc(100% + ${tipXMargin})`,
    transform: 'translateX(0) translateY(-50%)',
  },
  rightOnly: {
    left: `calc(100% + ${tipXMargin})`,
    transform: 'translateX(0) translateY(-50%)',
  },
  dark: {
    backgroundColor: Color.primaryBlack,
    color: Color.primaryWhite,
  },
}

const positionStyle = (position?: TipPositions): Stylesheet => {
  switch (position) {
    case 'left':
      return tipStyles.left
    case 'right':
      return tipStyles.right
    case 'bottom':
      return tipStyles.bottom
    case 'topLeft':
      return { ...tipStyles.leftOnly, ...{ top: `-${tipXMargin}` } }
    case 'topRight':
      return { ...tipStyles.rightOnly, ...{ top: `-${tipXMargin}` } }
    case 'bottomLeft':
      return { ...tipStyles.leftOnly, ...tipStyles.bottom }
    case 'bottomRight':
      return { ...tipStyles.rightOnly, ...tipStyles.bottom }
    case 'top':
    default:
      return tipStyles.top
  }
}
