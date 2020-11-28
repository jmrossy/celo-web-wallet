import { Box } from 'src/components/layout/Box'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function ImportWalletWarning() {
  return (
    <Box direction="column" align="center" justify="center" styles={style.container}>
      <p css={style.text}>
        Never input your Account Key for high-value accounts. Use this tool for small ‘hot’ wallets.
      </p>
      <p css={style.text}>
        The Celo Wallet tries its best to protect your funds but there{' '}
        <a css={Font.linkLight} href="TODO" target="_blank" rel="noopener noreferrer">
          are still risks
        </a>{' '}
        .
      </p>
      <p css={style.text}>
        For bigger accounts, use the{' '}
        <a
          css={Font.linkLight}
          href="https://valoraapp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Valora mobile app
        </a>{' '}
        or a{' '}
        <a
          css={Font.linkLight}
          href="https://docs.celo.org/celo-owner-guide/ledger"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ledger hardware wallet
        </a>
        .
      </p>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '26em',
  },
  text: {
    ...Font.body,
    margin: '0.5em 0.4em',
    lineHeight: '1.5em',
    textAlign: 'center',
    ':first-of-type': {
      ...Font.bold,
      marginTop: '2em',
    },
    [mq[768]]: {
      margin: '0.6em 1.4em',
    },
  },
}
