import Lightbulb from '../../components/icons/lightbulb.svg'
import { Box } from '../../components/layout/Box'
import { useDailyTip } from '../home/Tips'
import { Color } from '../../styles/Color'
import { Font } from '../../styles/fonts'
import { mq, useIsMobile } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'

export function HeaderSection() {
  const isMobile = useIsMobile()
  const tipText = useDailyTip()

  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome back!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={Lightbulb} css={style.icon} alt="Tip" />
          <label css={[Font.body, Font.bold]}>Tip of the day</label>
        </Box>
        {isMobile ? (
          <p css={style.tip}>{tipText.map((line) => line + ' ')}</p>
        ) : (
          <>
            {tipText.map((line, index) => (
              <p css={style.tip} key={`tip-line-${index}`}>
                {line}
              </p>
            ))}
          </>
        )}
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
      margin: '0 0 1em 0',
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
    lineHeight: '1.4em',
    margin: '1em 0 0 0',
  },
}
