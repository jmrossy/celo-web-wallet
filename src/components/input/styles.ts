import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export const sharedInputStyles: Stylesheet = {
  input: {
    borderRadius: 3,
    outline: 'none',
    border: `2px solid ${Color.borderInactive}`,
    ':focus': {
      borderColor: Color.borderActive,
    },
    padding: '0.1em 0.5em',
  },
}

export const sharedInputStylesWithError = (isError: boolean | undefined = undefined) => ({
  input: {
    borderRadius: 3,
    outline: 'none',
    border: `2px solid ${isError ? Color.borderError : Color.borderInactive}`,
    ':focus': {
      borderColor: isError ? Color.borderError : Color.borderActive,
    },
    padding: '0.1em 0.5em',
  },
});

export const InputStyleConstants = {
  defaultHeight: 40,
  border: `2px solid ${Color.borderInactive}`,
  borderRadius: '3px',
  padding: '2px 8px',
  paddingTextArea: '8px 8px',
}