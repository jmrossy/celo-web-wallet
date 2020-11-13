import { PropsWithChildren } from 'react'
import { Box } from 'src/components/layout/Box'
import { Stylesheet } from 'src/styles/types'

export function ScreenContentFrame(props: PropsWithChildren<unknown>) {
  return (
    <Box direction="column" styles={style.contentContainer}>
      {props.children}
    </Box>
  )
}

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
    padding: '2em 2em 2em 4em',
  },
}
