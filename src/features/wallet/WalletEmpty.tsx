import liftoff from 'src/components/icons/liftoff.svg'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function WalletEmpty() {
  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome to your Celo wallet!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={liftoff} css={style.icon} />
          <label css={[Font.body, Font.bold]}>Get started</label>
        </Box>
        <p css={Font.body}>
          To fund your account you can <a href="#">buy currency</a> from an exchange,{' '}
          <a href="#">redeem an invite code</a>, or ask a friend on Celo to{' '}
          <a href="#">send a payment</a> to your address.
        </p>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1,
    marginBottom: '1em',
    color: Color.primaryGreen,
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
}
