import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

export const sharedInputStyles: Styles = {
  borderRadius: 3,
  outline: 'none',
  border: `2px solid ${Color.borderInactive}`,
  ':focus': {
    borderColor: Color.borderActive,
  },
}

export const sharedInputStylesWithError: Styles = {
  ...sharedInputStyles,
  borderRadius: 3,
  outline: 'none',
  border: `2px solid ${Color.borderError}`,
  ':focus': {
    borderColor: Color.borderError,
  },
}

export const getSharedInputStyles = (isError: boolean | undefined = undefined) =>
  isError ? sharedInputStylesWithError : sharedInputStyles
