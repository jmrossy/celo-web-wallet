import { css, keyframes } from '@emotion/react'
import elipse from 'src/components/icons/celo_elipse.svg'
import echo1 from 'src/components/icons/elipse_echo_1.svg'
import echo2 from 'src/components/icons/elipse_echo_2.svg'
import echo3 from 'src/components/icons/elipse_echo_3.svg'
import { Box } from 'src/components/layout/Box'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function SplashScreen() {
  return (
    <Box styles={style.container}>
      <img src={elipse} css={style.elipse} />
      <img src={echo1} css={[style.echo, echoStyle(1)]} />
      <img src={echo2} css={[style.echo, echoStyle(2)]} />
      <img src={echo3} css={[style.echo, echoStyle(3)]} />
    </Box>
  )
}

const pulse = keyframes`
  0% { opacity: 0; }
  75% { opacity: 1; } 
  100% { opacity: 0; } 
`
const style: Stylesheet = {
  container: {
    height: '100vh',
    width: '100vh',
    minHeight: '-webkit-fill-available',
  },
  elipse: {
    opacity: 0,
    position: 'fixed',
    margin: 'auto',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animation: `${pulse} 3s infinite`,
  },
  echo: {
    opacity: 0,
    position: 'fixed',
    margin: 'auto',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animation: `${pulse} 3s infinite`,
  },
}

const echoStyle = (index: number) => {
  const delay = `${0.25 * index}s`
  switch (index) {
    case 1:
      return css({
        left: 30,
        bottom: 30,
        animationDelay: delay,
      })
    case 2:
      return css({
        left: 60,
        bottom: 120,
        animationDelay: delay,
      })
    case 3:
      return css({
        left: -40,
        bottom: 90,
        animationDelay: delay,
        [mq[480]]: { left: 60 },
      })
    default:
      return css({})
  }
}
