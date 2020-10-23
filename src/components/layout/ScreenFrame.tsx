import { PropsWithChildren } from 'react'
import { Footer } from 'src/components/footer/Footer'
import { Header } from 'src/components/header/Header'
import { Box } from 'src/components/layout/Box'

export function ScreenFrame(props: PropsWithChildren<unknown>) {
  return (
    <Box direction="column" styles={{ height: '100vh' }}>
      <Header />
      <div css={{ flex: 1, overflow: 'auto' }}>{props.children}</div>
      <Footer />
    </Box>
  )
}
