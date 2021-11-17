import { PropsWithChildren } from 'react'
import { Footer } from '../footer/Footer'
import { Header } from '../header/Header'
import { Box } from './Box'
import { Stylesheet } from '../../styles/types'

export function HeaderFooterFrame(props: PropsWithChildren<unknown>) {
  return (
    <Box direction="column" styles={style.container}>
      <Header />
      <div css={style.content}>{props.children}</div>
      <Footer />
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    height: '100vh',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
}
