import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

export const sharedInputStyles: Styles = {
  borderRadius: 3,
  outline: 'none',
  border: `1px solid ${Color.borderInactive}`,
  ':focus': {
    borderColor: Color.borderActive,
  },
  '::placeholder': {
    color: Color.borderInactive,
    opacity: 1 /* Firefox */,
  },
}

export const sharedInputStylesWithError: Styles = {
  ...sharedInputStyles,
  borderRadius: 3,
  outline: 'none',
  border: `1px solid ${Color.borderError}`,
  ':focus': {
    borderColor: Color.borderError,
  },
}

export const getSharedInputStyles = (isError: boolean | undefined = undefined) =>
  isError ? sharedInputStylesWithError : sharedInputStyles
