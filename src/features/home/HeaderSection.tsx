import tip from 'src/components/icons/tip.svg'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function HeaderSection() {
  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome back!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={tip} css={style.icon} />
          <label css={[Font.body, Font.bold]}>Tip of the day</label>
        </Box>
        <p css={Font.body}>
          Something smart about cryptocurrency and if you follow what this tip says, you might be a
          little bit more successful than you are today.
        </p>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1,
    marginBottom: '1em',
    color: Color.primaryGreen,
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
}
