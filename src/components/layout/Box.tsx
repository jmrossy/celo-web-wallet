import { CSSObject } from '@emotion/core'
import React from 'react'

interface BoxProps {
  direction?: 'column' | 'row'
  align?: 'start' | 'end' | 'center' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'around' | 'between' | 'evenly'
  // Other css styles to be applied
  // Can't call it 'css' or Emotion will pre-parse it out
  styles?: CSSObject
}

// Just a handy component for a display: flex wrapper
export function Box(props: React.PropsWithChildren<BoxProps>) {
  const styles = transformPropStyles(props)
  return (
    <div
      css={{
        display: 'flex',
        boxSizing: 'border-box',
        ...styles,
      }}
    >
      {props.children}
    </div>
  )
}

function transformPropStyles(props: BoxProps): CSSObject {
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

  return {
    flexDirection: direction,
    alignItems,
    justifyContent,
    ...passThroughStyles,
  }
}
