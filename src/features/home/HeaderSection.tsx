import Lightbulb from 'src/components/icons/lightbulb.svg'
import { Box } from 'src/components/layout/Box'
import { useDailyTip } from 'src/features/home/Tips'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function HeaderSection() {
  const tipText = useDailyTip()

  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome back!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={Lightbulb} css={style.icon} alt="Tip" />
          <label css={[Font.body, Font.bold]}>Tip of the day</label>
        </Box>
        {tipText.map((line, index) => (
          <p css={style.tip} key={`tip-line-${index}`}>
            {line}
          </p>
        ))}
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  header: {
    display: 'none',
    [mq[768]]: {
      display: 'block',
      ...Font.h1,
      marginBottom: '1.2em',
      color: Color.primaryGreen,
    },
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
  tip: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
}
