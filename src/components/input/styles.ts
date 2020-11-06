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
