import { PropsWithChildren } from 'react'
import { Styles } from 'src/styles/types'

interface BoxProps {
  direction?: 'column' | 'row'
  align?: 'start' | 'end' | 'center' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'around' | 'between' | 'evenly'
  margin?: string | number
  wrap?: boolean
  // Other css styles to be applied
  // Can't call it 'css' or Emotion will pre-parse it out
  styles?: Styles
}

// Just a handy component for a display: flex wrapper
export function Box(props: PropsWithChildren<BoxProps>) {
  const styles = transformPropStyles(props)
  return (
    <div
      css={{
        display: 'flex',
        boxSizing: 'border-box',
        margin: props.margin,
        ...styles,
      }}
    >
      {props.children}
    </div>
  )
}

function transformPropStyles(props: BoxProps): Styles {
  const { direction, align, justify, styles: passThroughStyles } = props

  let alignItems: string | undefined
  switch (align) {
    case 'start':
      alignItems = 'flex-start'
      break
    case 'end':
      alignItems = 'flex-end'
      break
    default:
      alignItems = align
  }

  let justifyContent: string | undefined
  switch (justify) {
    case 'start':
      justifyContent = 'flex-start'
      break
    case 'end':
      justifyContent = 'flex-end'
      break
    case 'around':
      justifyContent = 'space-around'
      break
    case 'between':
      justifyContent = 'space-between'
      break
    case 'evenly':
      justifyContent = 'space-evenly'
      break
    default:
      justifyContent = justify
  }

  const flexWrap: string | undefined = props.wrap ? 'wrap' : undefined

  return {
    flexDirection: direction,
    alignItems,
    justifyContent,
    flexWrap,
    ...passThroughStyles,
  }
}
