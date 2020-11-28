import Mail from 'src/components/icons/mail.svg'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function HeaderSectionEmpty() {
  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome to your Celo wallet!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={Mail} css={style.icon} />
          <label css={[Font.body, Font.bold]}>Get started</label>
        </Box>
        <p css={style.tip}>All new wallets start empty. Add funds to start using Celo.</p>
        <p css={style.tip}>
          You can{' '}
          <a href="#" css={Font.linkLight}>
            buy currency
          </a>{' '}
          from an exchange or ask a friend on Celo to send a payment to{' '}
          <a href="#" css={Font.linkLight}>
            your address.
          </a>
        </p>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1,
    marginBottom: '1.2em',
    color: Color.primaryGreen,
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
