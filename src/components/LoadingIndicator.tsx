import { css, keyframes } from '@emotion/react'
import { memo } from 'react'
import elipse from 'src/components/icons/celo_elipse.svg'
import echo1 from 'src/components/icons/elipse_echo_1.svg'
import echo2 from 'src/components/icons/elipse_echo_2.svg'
import echo3 from 'src/components/icons/elipse_echo_3.svg'
import { Box } from 'src/components/layout/Box'
import { Stylesheet } from 'src/styles/types'

function _LoadingIndicator() {
  return (
    <Box styles={style.container}>
      <img src={elipse} css={style.elipse} />
      <img src={echo1} css={[style.echo, echoStyle(1)]} />
      <img src={echo2} css={[style.echo, echoStyle(2)]} />
      <img src={echo3} css={[style.echo, echoStyle(3)]} />
    </Box>
  )
}

export const LoadingIndicator = memo(_LoadingIndicator)

const pulse = keyframes`
  0% { opacity: 0; }
  75% { opacity: 1; } 
  100% { opacity: 0; } 
`
const style: Stylesheet = {
  container: {
    height: '100%',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    overflow: 'hidden',
  },
  elipse: {
    gridRowStart: 1,
    gridColumnStart: 1,
    height: '6em',
    margin: 'auto',
    marginTop: '6em',
    marginLeft: '4.5em',
    opacity: 0,
    animation: `${pulse} 3s infinite`,
  },
  echo: {
    gridRowStart: 1,
    gridColumnStart: 1,
    margin: 'auto',
    opacity: 0,
    animation: `${pulse} 3s infinite`,
  },
}

const echoStyle = (index: number) => {
  const delay = `${0.25 * index}s`
  switch (index) {
    case 1:
      return css({
        height: '12em',
        marginTop: '2em',
        // marginRight: '3em',
        marginLeft: '2.5em',
        animationDelay: delay,
      })
    case 2:
      return css({
        height: '18em',
        marginTop: '-2em',
        // marginRight: '-0.5em',
        marginLeft: '0.5em',
        animationDelay: delay,
      })
    case 3:
      return css({
        height: '24em',
        marginTop: '-6em',
        // marginRight: '-6.5em',
        marginLeft: '-2.5em',
        animationDelay: delay,
      })
    default:
      return css({})
  }
}
