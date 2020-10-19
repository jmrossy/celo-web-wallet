import React from 'react'
import { Box } from 'src/components/layout/Box'

export function Footer() {
  return (
    <Box align="center" justify="center" styles={style.container}>
      <a css={style.anchor} href="https://celo.org">
        Learn More About Celo
      </a>
      <a css={style.anchor} href="https://valoraapp.com">
        Try the Celo Mobile Wallet
      </a>
      <a css={style.anchor} href="https://github.com/celo-tools/celo-web-wallet">
        View Source on Github
      </a>
    </Box>
  )
}

const style = {
  container: {
    padding: '2rem 0',
  },
  anchor: {
    // TODO style these
    padding: '0 1rem',
  },
}
