import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

// Shared / common styles for modal content
export const modalStyles: Stylesheet = {
  h3: {
    ...Font.body,
    textAlign: 'center',
    maxWidth: '24em',
    lineHeight: '1.6em',
  },
  p: {
    ...Font.body2,
    textAlign: 'center',
    maxWidth: '25em',
    lineHeight: '1.6em',
    margin: '1em 0 0 0',
  },
}
