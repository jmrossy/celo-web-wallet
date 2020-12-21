import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export const onboardingStyles: Stylesheet = {
  description: {
    ...Font.body,
    textAlign: 'center',
    maxWidth: '20em',
    lineHeight: '1.6em',
    margin: 0,
  },
}
