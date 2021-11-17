import { AccountMenu } from '../header/AccountMenu'
import { BalanceSummary } from '../header/BalanceSummary'
import { HeaderLogo } from '../header/HeaderLogo'
import { Box } from '../layout/Box'
import { Color } from '../../styles/Color'
import { Stylesheet } from '../../styles/types'

export function Header() {
  return (
    <header>
      <Box align="center" justify="between" styles={style.container}>
        <HeaderLogo />
        <BalanceSummary />
        <AccountMenu />
      </Box>
    </header>
  )
}

const style: Stylesheet = {
  container: {
    borderBottom: `1px solid ${Color.borderLight}`,
    padding: '0.4em 0.5em 0.4em 0.6em',
  },
}
